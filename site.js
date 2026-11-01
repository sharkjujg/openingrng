// Everything specific to OpeningRNG: names, copy, card art, and which facts the result card shows. app.js is generic.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = (n) => n.toLocaleString('en');
const band = (x, cuts) => cuts.find(([max]) => x < max)[1];
const VOLUME = { A: 'Flank and irregular (A)', B: 'Semi-open games (B)', C: 'Open games and the French (C)', D: 'Closed and semi-closed games (D)', E: 'Indian defenses (E)' };
const family = (m) => m.name.split(':')[0].trim();
const numbered = (mv) => mv.reduce((out, t, i) => out + (i % 2 === 0 ? `${i / 2 + 1}. ${t}` : ` ${t} `), '').trim();

export default {
  key: 'openingrng',
  name: 'OpeningRNG',
  pageTitle: 'OpeningRNG: a daily chess opening discovery game',
  noun: 'opening', nouns: 'openings', thing: 'Opening',
  worldNote: 'every chess opening ever played',
  repo: 'https://github.com/sharkjujg/openingrng',
  headline: 'Discover an opening. Once a day.',
  intro: (n) => `Roll once to draw one named chess opening from a pool of <b>${fmt(n)}</b>. Every opening has the same 1-in-${fmt(n)} chance, mainline or obscure. Badges explain what is unusual about it, and rarer badges earn more rarity points (RP). The daily limit resets at 00:00 UTC.`,
  notice: 'Prototype: the openings and their moves are real (from the Lichess chess-openings collection, CC0), but there are no accounts yet, and your results are saved only in this browser. <a href="#/about">What that means</a>',
  header: (m) => ({ title: m.name, sub: `ECO ${m.eco} · ${m.plies} half-move${m.plies === 1 ? '' : 's'}` }),
  label: (m) => `${m.name} (${m.eco})`,
  shelves: (m) => [
    ['ECO volume', VOLUME[m.eco[0]]], ['ECO code', m.eco], ['Family', family(m)], ['First move', m.first],
    ['Length', band(m.plies, [[4, '1 to 3 half-moves'], [8, '4 to 7 half-moves'], [12, '8 to 11 half-moves'], [16, '12 to 15 half-moves'], [Infinity, '16 or more half-moves']])],
    ['Last move by', m.plies % 2 === 1 ? 'White' : 'Black'],
    ['Captures', m.captures === 0 ? 'None' : m.captures <= 2 ? '1 or 2' : '3 or more'],
    ['Castling', m.castleK && m.castleQ ? 'Both sides' : m.castleK ? 'Kingside' : m.castleQ ? 'Queenside' : 'None'],
  ],
  facts: (m) => [
    ['ECO code', `${m.eco} (${VOLUME[m.eco[0]]})`], ['Family', family(m)], ['Moves', numbered(m.mv)],
    ['Half-moves', String(m.plies)], ['Captures', String(m.captures)], ['Checks', String(m.checks)],
    ['Castling', m.castleK && m.castleQ ? 'Both sides' : m.castleK ? 'Kingside' : m.castleQ ? 'Queenside' : 'None'],
    ['Last move by', m.plies % 2 === 1 ? 'White' : 'Black'],
    ['Source', `Lichess chess-openings ${m.id}`, 'https://github.com/lichess-org/chess-openings'],
  ],
  art(m) { // original move map: the board square each half-move lands on, numbered, ivory for White and charcoal for Black; it never affects scoring
    const dest = (t, white) => {
      const c = t.replace(/[+#]/g, '');
      if (c === 'O-O') return white ? 'g1' : 'g8';
      if (c === 'O-O-O') return white ? 'c1' : 'c8';
      const sq = c.replace(/=[QRBN]$/, '').slice(-2);
      return /^[a-h][1-8]$/.test(sq) ? sq : null;
    };
    const cell = 10, x0 = 10, y0 = 8, marks = new Map();
    m.mv.slice(0, 24).forEach((t, i) => { const sq = dest(t, i % 2 === 0); if (sq) marks.set(sq, { n: i + 1, white: i % 2 === 0 }); });
    let squares = '', dots = '';
    for (let f = 0; f < 8; f++) for (let r = 0; r < 8; r++) squares += `<rect x="${x0 + f * cell}" y="${y0 + (7 - r) * cell}" width="${cell}" height="${cell}" fill="${(f + r) % 2 === 0 ? '#8a6f3d' : '#d9c79a'}"/>`;
    for (const [sq, k] of marks) {
      const cx = x0 + (sq.charCodeAt(0) - 97) * cell + cell / 2, cy = y0 + (8 - Number(sq[1])) * cell + cell / 2;
      dots += `<circle cx="${cx}" cy="${cy}" r="4.1" fill="${k.white ? '#f7f3e6' : '#262a33'}" stroke="${k.white ? '#262a33' : '#f7f3e6'}" stroke-width=".5"/><text x="${cx}" y="${cy + 1.7}" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="4.6" fill="${k.white ? '#262a33' : '#f7f3e6'}">${k.n}</text>`;
    }
    return `<svg class="avatar" viewBox="0 0 100 100" role="img" aria-label="Generated move map for the opening: the squares its half-moves land on, in order. Not a diagram of the final position.">
      <rect width="100" height="100" rx="8" fill="#1d2027"/>${squares}${dots}
      <text x="50" y="97" text-anchor="middle" font-family="system-ui,sans-serif" font-size="5" letter-spacing=".6" fill="#9aa3b5">GENERATED MOVE MAP · ${esc(m.eco)}</text></svg>`;
  },
  poolNotice: 'Every opening comes from the <a href="https://github.com/lichess-org/chess-openings">lichess-org chess-openings</a> collection, which is released under CC0, as a snapshot: every named line in its five files, one per distinct move sequence. The collection is a catalog of names, not a ranking: a long obscure sub-line counts as much as the Ruy Lopez itself, so the pool describes this naming scheme, not how often an opening is played. The odds are per named line.',
  poolExtra(pool) {
    const tally = (get) => { const c = new Map(); for (const m of pool.members) for (const v of get(m)) c.set(v, (c.get(v) || 0) + 1); return [...c]; };
    const table = (title, rows) => `<table><thead><tr><th>${title}</th><th class="n">Openings</th></tr></thead><tbody>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="n">${fmt(v)}</td></tr>`).join('')}</tbody></table>`;
    const top = (rows, k) => rows.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, k);
    return `<h2>What is in the pool</h2><p class="small muted">Disclosed because a badge is only rare relative to this mix.</p>
      ${table('ECO volume', top(tally((m) => [VOLUME[m.eco[0]]]), 5))}${table('First move', top(tally((m) => [m.first]), 8))}${table('Top families', top(tally((m) => [family(m)]), 10))}`;
  },
  aboutData: `<h2>Where the facts come from</h2>
    <p>Each opening's ECO code, name and moves come from the <a href="https://github.com/lichess-org/chess-openings">lichess-org chess-openings</a> collection, whose data is released under CC0 (public domain). Moves are shown in standard notation; this site does not check them against the rules of chess beyond reading the notation, and the pool page lists the checks run on the data (for example that every line starts with one of White's 20 legal first moves). Badges about captures, checks and castling are counted from the notation. The artwork is a generated move map, not a board diagram of the position.</p>`,
  terms: 'It is not affiliated with Lichess, FIDE or any chess federation. Badges describe how an opening is named and written, not how good it is.',
};
