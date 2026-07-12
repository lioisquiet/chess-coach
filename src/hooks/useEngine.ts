import { useEffect, useRef } from 'react';
import { toCandidates } from '../lib/candidates';
import { normalizeToWhitePov, pvToSteps } from '../lib/chessUtils';
import { EngineWorkerClient } from '../lib/engine/engineWorkerClient';
import type { EngineScore, PvInfo } from '../lib/engine/uciParser';
import { useAnalysisStore } from '../store/analysisStore';
import { useCoachStore } from '../store/coachStore';
import { useGameStore } from '../store/gameStore';

const COACH_MULTIPV = 5;
const COACH_DEPTH = 18;
const ANALYZER_DEPTH = 14;

const sideToMoveOf = (fen: string): 'w' | 'b' => (fen.split(' ')[1] === 'b' ? 'b' : 'w');

/** Maps the 1..8 UI level onto Stockfish skill and a per-move time budget. */
function levelToSearch(level: number): { skill: number; movetime: number } {
  const skill = Math.round(((level - 1) / 7) * 20); // 0..20
  const movetime = 150 + (level - 1) * 250; // 150ms..1900ms
  return { skill, movetime };
}

/**
 * Owns the three engine workers for the app's lifetime:
 *  - opponent: strength-limited, replies when it is the engine's turn
 *  - coach: full strength MultiPV, analyzes only when hints are requested
 *  - analyzer: evaluates the current position after every ply for the eval bar,
 *    move-quality feedback, and post-game review
 */
export function useEngine() {
  const opponentRef = useRef<EngineWorkerClient | null>(null);
  const coachRef = useRef<EngineWorkerClient | null>(null);
  const analyzerRef = useRef<EngineWorkerClient | null>(null);

  useEffect(() => {
    const opponent = new EngineWorkerClient();
    const coach = new EngineWorkerClient();
    const analyzer = new EngineWorkerClient();
    opponentRef.current = opponent;
    coachRef.current = coach;
    analyzerRef.current = analyzer;
    coach.setOptions({ MultiPV: COACH_MULTIPV });

    return () => {
      opponent.dispose();
      coach.dispose();
      analyzer.dispose();
      opponentRef.current = null;
      coachRef.current = null;
      analyzerRef.current = null;
    };
  }, []);

  // Drive the analyzer: re-evaluate whenever the game position changes.
  useEffect(() => {
    let prevFen: string | null = null;
    let prevPly = 0;

    const analyzePosition = (fen: string, ply: number) => {
      const analyzer = analyzerRef.current;
      if (!analyzer) return;
      const side = sideToMoveOf(fen);
      let lastBestSan: string | null = null;

      const record = (score: EngineScore) =>
        useAnalysisStore.getState().recordEval({
          ply,
          fen,
          score: normalizeToWhitePov(score, side),
          bestMoveSan: lastBestSan,
        });

      analyzer.analyze(fen, `go depth ${ANALYZER_DEPTH}`, {
        onInfo: (info) => {
          if (info.multipv !== 1) return;
          lastBestSan = pvToSteps(fen, info.pv.slice(0, 1))[0]?.san ?? lastBestSan;
          record(info.score); // stream so the eval bar tracks live
        },
      });
    };

    const run = () => {
      const state = useGameStore.getState();
      if (state.fen === prevFen) return;

      const ply = state.history.length;
      if (ply < prevPly) useAnalysisStore.getState().truncate(ply);
      useAnalysisStore.getState().setCurrentPly(ply);
      analyzePosition(state.fen, ply);

      prevFen = state.fen;
      prevPly = ply;
    };

    const unsubscribe = useGameStore.subscribe(run);
    run(); // evaluate the starting position immediately
    return unsubscribe;
  }, []);

  // Drive the opponent: whenever it becomes the engine's turn, search and play.
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe(() => {
      const state = useGameStore.getState();
      const opponent = opponentRef.current;
      if (!opponent) return;

      const engineToMove =
        !state.gameOverText && state.fen.split(' ')[1] !== state.playerColor;

      if (!engineToMove || state.isEngineThinking) return;

      const { skill, movetime } = levelToSearch(state.engineLevel);
      const fenAtRequest = state.fen;
      state.setEngineThinking(true);

      opponent.setOptions({ 'Skill Level': skill }).then(() => {
        opponent.analyze(fenAtRequest, `go movetime ${movetime}`, {
          onBestMove: (uci) => {
            const current = useGameStore.getState();
            current.setEngineThinking(false);
            if (uci && current.fen === fenAtRequest) current.applyEngineMove(uci);
          },
        });
      });
    });

    return unsubscribe;
  }, []);

  const requestHints = (fen: string) => {
    const coach = coachRef.current;
    if (!coach) return;

    useCoachStore.getState().beginAnalysis(fen);
    const latestByRank = new Map<number, PvInfo>();

    coach.analyze(fen, `go depth ${COACH_DEPTH}`, {
      onInfo: (info) => {
        latestByRank.set(info.multipv, info);
        useCoachStore
          .getState()
          .updateCandidates(fen, toCandidates(fen, [...latestByRank.values()]));
      },
      onBestMove: () => useCoachStore.getState().finishAnalysis(fen),
    });
  };

  const stopHints = () => coachRef.current?.stop();

  return { requestHints, stopHints };
}
