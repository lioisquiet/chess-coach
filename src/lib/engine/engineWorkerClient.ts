import { parseBestMove, parseInfoLine, type PvInfo } from './uciParser';

const ENGINE_URL = `${import.meta.env.BASE_URL}engine/stockfish-18-lite-single.js`;

export interface AnalysisHandlers {
  onInfo?: (info: PvInfo) => void;
  onBestMove?: (uci: string | null) => void;
}

/**
 * Thin wrapper around a single Stockfish web worker speaking UCI.
 * One client owns one worker; the app runs two (opponent + coach).
 */
export class EngineWorkerClient {
  private worker: Worker;
  private ready: Promise<void>;
  private handlers: AnalysisHandlers = {};

  constructor() {
    this.worker = new Worker(ENGINE_URL);
    this.worker.addEventListener('message', this.handleMessage);
    this.ready = this.handshake();
  }

  private handshake(): Promise<void> {
    return new Promise((resolve) => {
      const onReady = (event: MessageEvent) => {
        if (typeof event.data === 'string' && event.data.includes('uciok')) {
          this.worker.removeEventListener('message', onReady);
          resolve();
        }
      };
      this.worker.addEventListener('message', onReady);
      this.worker.postMessage('uci');
    });
  }

  private handleMessage = (event: MessageEvent) => {
    const line = typeof event.data === 'string' ? event.data : '';
    if (!line) return;

    if (line.startsWith('info')) {
      const info = parseInfoLine(line);
      if (info) this.handlers.onInfo?.(info);
    } else if (line.startsWith('bestmove')) {
      this.handlers.onBestMove?.(parseBestMove(line));
    }
  };

  async setOptions(options: Record<string, string | number>): Promise<void> {
    await this.ready;
    for (const [name, value] of Object.entries(options)) {
      this.worker.postMessage(`setoption name ${name} value ${value}`);
    }
  }

  /** Starts a search for the given FEN. Cancels any search already running. */
  async analyze(
    fen: string,
    go: string,
    handlers: AnalysisHandlers,
  ): Promise<void> {
    await this.ready;
    this.handlers = handlers;
    this.worker.postMessage('stop');
    this.worker.postMessage(`position fen ${fen}`);
    this.worker.postMessage(go);
  }

  stop(): void {
    this.worker.postMessage('stop');
  }

  dispose(): void {
    this.worker.removeEventListener('message', this.handleMessage);
    this.worker.terminate();
  }
}
