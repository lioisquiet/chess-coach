// Generates src/data/openings.json from the vendored lichess ECO TSVs.
// Each opening's PGN is replayed to a position; the position (first four FEN
// fields, so move counters don't matter) maps to { eco, name }. When several
// openings share a position, the deepest (longest PGN) name wins.
import { Chess } from 'chess.js';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ecoDir = join(here, '..', 'data', 'eco');
const outFile = join(here, '..', 'src', 'data', 'openings.json');

/** First four FEN fields — placement, side, castling, en passant. */
function positionKey(fen) {
  return fen.split(' ').slice(0, 4).join(' ');
}

const byPosition = new Map(); // key -> { eco, name, plies }

for (const file of readdirSync(ecoDir).filter((f) => f.endsWith('.tsv'))) {
  const rows = readFileSync(join(ecoDir, file), 'utf8').trim().split('\n').slice(1);
  for (const row of rows) {
    const [eco, name, pgn] = row.split('\t');
    if (!pgn) continue;

    const chess = new Chess();
    const sans = pgn.replace(/\d+\.(\.\.)?/g, ' ').trim().split(/\s+/);
    let plies = 0;
    try {
      for (const san of sans) {
        chess.move(san);
        plies += 1;
      }
    } catch {
      continue; // skip any malformed line rather than fail the whole build
    }

    const key = positionKey(chess.fen());
    const existing = byPosition.get(key);
    if (!existing || plies > existing.plies) {
      byPosition.set(key, { eco, name, plies });
    }
  }
}

const out = {};
for (const [key, { eco, name }] of byPosition) out[key] = { eco, name };

writeFileSync(outFile, JSON.stringify(out));
console.log(`Wrote ${Object.keys(out).length} opening positions to ${outFile}`);
