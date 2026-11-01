// OpeningRNG fixtures for check.html: one row per case, [rule id, field overrides, expected match].
export const V = '2026-11-01';
export const base = { id: 'B00-1', eco: 'B00', name: 'Sample Opening', moves: 'e4 e5 Nf3 Nc6' };

const CYCLE = ['Nf3', 'Nf6', 'Ng1', 'Ng8']; // a legal-looking shuttle of knight moves: k half-moves starting with White's knight
const line = (k) => Array.from({ length: k }, (_, i) => CYCLE[i % 4]).join(' ');
const by = (id, key, rows) => rows.map(([v, want]) => [id, { [key]: v }, want]);
const names = (id, yes, no) => [...yes.map((n) => [id, { name: n }, true]), ...no.map((n) => [id, { name: n }, false])];
const nameCases = (id, yes, no) => [...names(id, yes, no), [id, { name: undefined }, false], [id, { name: '  ' }, false]];

export const cases = [
  ...by('one-mover', 'moves', [['e4', true], ['e4 e5', false], ['', false], [undefined, false], ['e9', false], ['e4 e5 zz', false]]),
  ...by('short-line', 'moves', [['e4', true], [line(3), true], [line(4), false], ['', false], [undefined, false]]),
  ...by('long-line', 'moves', [[line(14), true], [line(13), false], [undefined, false]]),
  ...by('deep-theory', 'moves', [[line(20), true], [line(19), false], [undefined, false]]),
  ...by('marathon-line', 'moves', [[line(26), true], [line(25), false], [undefined, false]]),

  ...by('king-pawn-start', 'moves', [['e4 e5', true], ['d4 d5', false], ['e3', false], [undefined, false]]),
  ...by('queen-pawn-start', 'moves', [['d4 d5', true], ['e4', false], ['d3', false], [undefined, false]]),
  ...by('english-start', 'moves', [['c4 e5', true], ['c3', false], ['e4', false], [undefined, false]]),
  ...by('knight-start', 'moves', [['Nf3', true], ['Nh3', true], ['Nc3 d5', true], ['e4', false], [undefined, false]]),
  ...['b3', 'b4', 'f3', 'f4', 'g3', 'g4'].map((f) => ['flank-pawn-start', { moves: f }, true]), ...by('flank-pawn-start', 'moves', [['e4', false], ['a3', false], ['Nf3', false]]),
  ...['a3', 'a4', 'h3', 'h4'].map((f) => ['rook-pawn-start', { moves: f }, true]), ...by('rook-pawn-start', 'moves', [['b3', false], ['e4', false], ['Nh3', false]]),

  ...['a', 'b', 'c', 'd', 'e'].flatMap((v) => [[`eco-${v}`, { eco: `${v.toUpperCase()}00` }, true], [`eco-${v}`, { eco: v === 'a' ? 'B00' : 'A00' }, false], [`eco-${v}`, { eco: null }, false], [`eco-${v}`, { eco: `${v}00` }, false]]),
  ...by('eco-zero', 'eco', [['A00', true], ['C00', true], ['A01', false], ['B10', false], ['Z00', false], [null, false]]),

  ...by('kingside-castle', 'moves', [['e4 e5 Nf3 Nc6 Bc4 Bc5 O-O', true], ['e4 e5 Nf3 Nc6 Bc4 Bc5 O-O+', true], ['e4 e5 Nf3 Nc6 O-O-O', false], ['e4 e5', false], [undefined, false]]),
  ...by('queenside-castle', 'moves', [['d4 d5 Nc3 Nc6 Bf4 Bf5 Qd2 Qd7 O-O-O', true], ['e4 e5 Nf3 Nc6 Bc4 Bc5 O-O', false], ['e4 e5', false], [undefined, false]]),
  ...by('opposite-castling', 'moves', [['d4 d5 Nc3 Nc6 Bf4 Bf5 Qd2 Qd7 O-O-O O-O', true], ['e4 e5 Nf3 Nc6 Bc4 Bc5 O-O', false], ['d4 d5 Nc3 Nc6 Bf4 Bf5 Qd2 Qd7 O-O-O', false], [undefined, false]]),

  ...by('trade-line', 'moves', [['e4 d5 exd5', true], ['e4 e5', false], [undefined, false]]),
  ...by('capture-heavy', 'moves', [['e4 d5 exd5 Qxd5 Nc3 Qxc3', true], ['e4 d5 exd5 Qxd5', false], [undefined, false]]),
  ...by('bloodbath', 'moves', [['e4 d5 exd5 Qxd5 Nc3 Qxc3 bxc3 Nf6 Nf3 Nxd5 cxd5', true], ['e4 d5 exd5 Qxd5 Nc3 Qxc3 bxc3', false], [undefined, false]]),
  ...by('quiet-line', 'moves', [[line(6), true], [line(5), false], ['e4 d5 exd5 Qxd5 Nc3 Qa5', false], [undefined, false]]),

  ...by('gives-check', 'moves', [['e4 f5 Qh5+', true], ['e4 f5 Qh5', false], [undefined, false]]),
  ...by('check-storm', 'moves', [['e4 f5 Qh5+ g6 Qxg6+', true], ['e4 f5 Qh5+ g6', false], [undefined, false]]),
  ...by('ends-in-mate', 'moves', [['f3 e5 g4 Qh4#', true], ['f3 e5 g4 Qh4+', false], ['f3 e5 g4 Qh4# Kd1', false], [undefined, false]]),

  ...by('queen-out-early', 'moves', [['e4 e5 Qh5', true], ['e4 e5 Nf3 Nc6 Bc4 Bc5 Qh5', false], ['e4 e5', false], [undefined, false]]),
  ...by('king-walk', 'moves', [['e4 e5 Ke2', true], ['e4 e5 Nf3 Nc6 Bc4 Bc5 O-O', false], ['e4 e5', false], [undefined, false]]),
  ...by('rook-move', 'moves', [['a4 a5 Ra3', true], ['a4 a5', false], [undefined, false]]),
  ...by('pawn-storm', 'moves', [['e4 e5 d4 d5', true], ['e4 e5 d4', false], ['e4 e5 d4 Nf6', false], ['e4 d5 exd5 e6', true], [undefined, false]]),

  ...by('ends-on-white', 'moves', [['e4', true], [line(3), true], [line(2), false], [undefined, false]]),
  ...by('ends-on-black', 'moves', [['e4 e5', true], [line(4), true], [line(3), false], [undefined, false]]),

  ...nameCases('gambit', ["King's Gambit", 'Gambit Accepted'], ['Gambling', 'Gambitry', 'Sample Opening']),
  ...nameCases('attack', ['Bird Attack', 'Attack Line'], ['Attacking Line', 'Counterattack', 'Sample Opening']),
  ...nameCases('system', ['London System'], ['Systematic Play', 'Sample Opening']),
  ...nameCases('counter', ['Counter Gambit', 'Countergambit', 'Counterattack'], ['Encounter', 'Sample Opening']),
  ...nameCases('main-line', ['Najdorf: Main Line'], ['Mainline', 'Sample Opening']),
  ...nameCases('trap', ['Fishing Pole Trap'], ['Trapezoid', 'Sample Opening']),
  ...nameCases('accepted', ['Queen Gambit Accepted'], ['Acceptable', 'Sample Opening']),
  ...nameCases('declined', ['Queen Gambit Declined'], ['Declination', 'Sample Opening']),

  ...nameCases('sicilian', ['Sicilian Defense: Najdorf'], ['Sicily Attack', 'Sample Opening']),
  ...nameCases('ruy-lopez', ['Ruy Lopez: Berlin', 'Spanish Game'], ['Ruy', 'Spaniard', 'Sample Opening']),
  ...nameCases('french', ['French Defense'], ['Frenchman', 'Sample Opening']),
  ...nameCases('italian', ['Italian Game'], ['Italy Opening', 'Sample Opening']),
  ...nameCases('queens-gambit', ["Queen's Gambit Declined", 'Queen’s Gambit'], ['Queen Gambit', "Queens Gambit", "King's Gambit"]),
  ...nameCases('kings-gambit', ["King's Gambit Accepted", 'King’s Gambit'], ['King Gambit', "Queen's Gambit"]),
  ...nameCases('english', ['English Opening'], ['Englishman', 'Sample Opening']),
  ...nameCases('indian', ["King's Indian Defense"], ['Indiana Opening', 'Sample Opening']),
  ...nameCases('caro-kann', ['Caro-Kann Defense'], ['Caro Kann', 'Sample Opening']),
  ...nameCases('scandinavian', ['Scandinavian Defense'], ['Scandinavia', 'Sample Opening']),
  ...nameCases('dutch', ['Dutch Defense'], ['Dutchman', 'Sample Opening']),
  ...nameCases('catalan', ['Catalan Opening'], ['Catalania', 'Sample Opening']),
  ...nameCases('alekhine', ['Alekhine Defense', 'Alekhines Gun'], ['Alekhin', 'Sample Opening']),
  ...nameCases('pirc', ['Pirc Defense'], ['Pirco', 'Sample Opening']),
  ...nameCases('london', ['London System'], ['Londoner', 'Sample Opening']),

  ...nameCases('possessive-name', ["Bird's Opening", 'Bird’s Opening'], ['Birds Opening', 'Sample Opening']),
  ...nameCases('hyphenated-name', ['Caro-Kann Defense'], ['Caro Kann Defense', 'Sample Opening']),
  ...nameCases('accented-name', ['Réti Opening', 'Grünfeld Defense'], ['Reti Opening', 'Queen’s Gambit', "Bird's Opening"]),
  ...nameCases('numbered-name', ['Opening 4', 'Line 1.e4'], ['Sample Opening']),
  ...nameCases('long-title', ['x'.repeat(70)], ['x'.repeat(69)]),
  ...nameCases('short-title', ['x'.repeat(12), 'Amar Opening'], ['x'.repeat(13)]),
  ...nameCases('comma-chain', ['Najdorf, English Attack, Main Line'], ['Najdorf, English Attack', 'Sample Opening']),
  ...nameCases('family-line', ['Sicilian Defense'], ['Sicilian Defense: Najdorf Variation']),
];

export function poolChecks(raw, pool, ok) {
  const ms = raw.members;
  const SAN = /^(O-O(-O)?|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](=[QRBN])?)[+#]?$/;
  const FIRST = new Set(['a3', 'a4', 'b3', 'b4', 'c3', 'c4', 'd3', 'd4', 'e3', 'e4', 'f3', 'f4', 'g3', 'g4', 'h3', 'h4', 'Na3', 'Nc3', 'Nf3', 'Nh3']); // White's 20 legal first moves
  ok('opening ids are ECO code plus a position and unique', ms.every((m) => /^[A-E][0-9]{2}-[1-9][0-9]*$/.test(m.id) && m.id.startsWith(m.eco + '-')) && new Set(ms.map((m) => m.id)).size === ms.length);
  ok('every opening has a name', ms.every((m) => typeof m.name === 'string' && m.name.trim()));
  ok('every move is valid notation', ms.every((m) => m.moves.split(' ').every((t) => SAN.test(t))));
  ok('every line starts with one of White’s 20 legal first moves', ms.every((m) => FIRST.has(m.moves.split(' ')[0])));
  ok('lines are 1 to 60 half-moves', ms.every((m) => { const k = m.moves.split(' ').length; return k >= 1 && k <= 60; }));
  ok('no two openings share the same moves', new Set(ms.map((m) => m.moves)).size === ms.length);
  ok('all five ECO volumes are present', ['A', 'B', 'C', 'D', 'E'].every((v) => ms.some((m) => m.eco[0] === v)));
  ok('the pool is large enough to be a game (>= 1000)', pool.n >= 1000);
}
