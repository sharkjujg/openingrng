// OpeningRNG badge rules. Each rule is a deterministic predicate over known fields: a value the collection does not have never matches.
// test(m, poolDate) and evidence(m, poolDate) read the prepared member from prep().

export const RULESET = '1';

export const norm = (s) => s.normalize('NFKC').toLowerCase();

const chars = (s) => Array.from(s);
const text = (x) => (typeof x === 'string' && x.trim() ? x.trim() : null);
const SAN = /^(O-O(-O)?|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](=[QRBN])?)[+#]?$/;
const bare = (t) => t.replace(/[+#]$/, '');

export function prep(raw) {
  const name = text(raw.name);
  const toks = typeof raw.moves === 'string' ? raw.moves.trim().split(/\s+/).filter(Boolean) : [];
  const mv = toks.length && toks.every((t) => SAN.test(t)) ? toks : []; // a move list that is not valid notation is unknown, never guessed at
  const has = mv.length > 0;
  return {
    ...raw,
    n: name ? norm(name) : null,
    eco: typeof raw.eco === 'string' && /^[A-E][0-9]{2}$/.test(raw.eco) ? raw.eco : null,
    mv, plies: has ? mv.length : null, first: has ? mv[0] : null,
    captures: has ? mv.filter((t) => t.includes('x')).length : null,
    checks: has ? mv.filter((t) => /[+#]$/.test(t)).length : null,
    mate: has ? mv.at(-1).endsWith('#') : null,
    castleK: has ? mv.some((t) => bare(t) === 'O-O') : null, castleQ: has ? mv.some((t) => bare(t) === 'O-O-O') : null,
    queenEarly: has ? mv.slice(0, 6).some((t) => t[0] === 'Q') : null,
    kingWalk: has ? mv.some((t) => t[0] === 'K') : null, rookMove: has ? mv.some((t) => t[0] === 'R') : null,
    pawnsOnly: has ? mv.every((t) => /^[a-h]/.test(t)) : null,
  };
}

const ply = (m) => `${m.name} takes ${m.plies} half-move${m.plies === 1 ? '' : 's'} to reach`;
const nm = (m) => `"${m.name}"`;
const code = (m) => `${m.name} is filed under ECO ${m.eco}`;
const open = (m) => `${m.name} begins 1. ${m.first}`;
const starts = (...firsts) => (m) => m.first !== null && firsts.includes(m.first);
const word = (re) => (m) => m.n !== null && re.test(m.n);
const volume = (letter) => (m) => m.eco !== null && m.eco[0] === letter;
const fam = (re) => word(re);

export const RULES = [
  { id: 'one-mover', name: 'One Mover', family: 'Length', rule: 'The line is a single half-move', test: (m) => m.plies === 1, evidence: ply },
  { id: 'short-line', name: 'Short Line', family: 'Length', rule: 'The line is 3 half-moves or fewer', test: (m) => m.plies !== null && m.plies <= 3, evidence: ply },
  { id: 'long-line', name: 'Long Line', family: 'Length', rule: 'The line is 14 half-moves (7 full moves) or more', test: (m) => m.plies !== null && m.plies >= 14, evidence: ply },
  { id: 'deep-theory', name: 'Deep Theory', family: 'Length', rule: 'The line is 20 half-moves (10 full moves) or more', test: (m) => m.plies !== null && m.plies >= 20, evidence: ply },
  { id: 'marathon-line', name: 'Marathon Line', family: 'Length', rule: 'The line is 26 half-moves (13 full moves) or more', test: (m) => m.plies !== null && m.plies >= 26, evidence: ply },

  { id: 'king-pawn-start', name: 'King Pawn Start', family: 'First move', rule: 'White opens 1. e4', test: starts('e4'), evidence: open },
  { id: 'queen-pawn-start', name: 'Queen Pawn Start', family: 'First move', rule: 'White opens 1. d4', test: starts('d4'), evidence: open },
  { id: 'english-start', name: 'English Start', family: 'First move', rule: 'White opens 1. c4', test: starts('c4'), evidence: open },
  { id: 'knight-start', name: 'Knight Start', family: 'First move', rule: 'White opens with a knight move', test: (m) => m.first !== null && m.first[0] === 'N', evidence: open },
  { id: 'flank-pawn-start', name: 'Flank Pawn Start', family: 'First move', rule: 'White opens 1. b3, b4, f3, f4, g3 or g4', test: starts('b3', 'b4', 'f3', 'f4', 'g3', 'g4'), evidence: open },
  { id: 'rook-pawn-start', name: 'Rook Pawn Start', family: 'First move', rule: 'White opens 1. a3, a4, h3 or h4', test: starts('a3', 'a4', 'h3', 'h4'), evidence: open },

  { id: 'eco-a', name: 'Flank and Irregular', family: 'ECO volume', rule: 'ECO volume A (flank and irregular openings)', test: volume('A'), evidence: code },
  { id: 'eco-b', name: 'Semi-Open', family: 'ECO volume', rule: 'ECO volume B (semi-open games)', test: volume('B'), evidence: code },
  { id: 'eco-c', name: 'Open and French', family: 'ECO volume', rule: 'ECO volume C (open games and the French)', test: volume('C'), evidence: code },
  { id: 'eco-d', name: 'Closed Games', family: 'ECO volume', rule: 'ECO volume D (closed and semi-closed games)', test: volume('D'), evidence: code },
  { id: 'eco-e', name: 'Indian Defenses', family: 'ECO volume', rule: 'ECO volume E (Indian defenses)', test: volume('E'), evidence: code },
  { id: 'eco-zero', name: 'Zero Code', family: 'ECO number', rule: 'ECO code ends in 00', test: (m) => m.eco !== null && m.eco.endsWith('00'), evidence: code },

  { id: 'kingside-castle', name: 'Kingside Castle', family: 'Castling', rule: 'The line includes castling kingside (O-O)', test: (m) => m.castleK === true, evidence: (m) => `${m.name} castles kingside` },
  { id: 'queenside-castle', name: 'Queenside Castle', family: 'Castling', rule: 'The line includes castling queenside (O-O-O)', test: (m) => m.castleQ === true, evidence: (m) => `${m.name} castles queenside` },
  { id: 'opposite-castling', name: 'Opposite Castling', family: 'Castling', rule: 'The line includes both O-O and O-O-O', test: (m) => m.castleK === true && m.castleQ === true, evidence: (m) => `${m.name} castles on both sides` },

  { id: 'trade-line', name: 'Trade Line', family: 'Captures', rule: 'The line includes at least one capture', test: (m) => m.captures !== null && m.captures >= 1, evidence: (m) => `${m.name} has ${m.captures} capture${m.captures === 1 ? '' : 's'}` },
  { id: 'capture-heavy', name: 'Capture Heavy', family: 'Captures', rule: 'The line includes 3 or more captures', test: (m) => m.captures !== null && m.captures >= 3, evidence: (m) => `${m.name} has ${m.captures} captures` },
  { id: 'bloodbath', name: 'Bloodbath', family: 'Captures', rule: 'The line includes 5 or more captures', test: (m) => m.captures !== null && m.captures >= 5, evidence: (m) => `${m.name} has ${m.captures} captures` },
  { id: 'quiet-line', name: 'Quiet Line', family: 'Captures', rule: 'A line of 6 or more half-moves with no capture', test: (m) => m.captures === 0 && m.plies >= 6, evidence: (m) => `${m.name} reaches ${m.plies} half-moves without a capture` },

  { id: 'gives-check', name: 'Gives Check', family: 'Checks', rule: 'The line includes at least one check', test: (m) => m.checks !== null && m.checks >= 1, evidence: (m) => `${m.name} has ${m.checks} check${m.checks === 1 ? '' : 's'}` },
  { id: 'check-storm', name: 'Check Storm', family: 'Checks', rule: 'The line includes 2 or more checks', test: (m) => m.checks !== null && m.checks >= 2, evidence: (m) => `${m.name} has ${m.checks} checks` },
  { id: 'ends-in-mate', name: 'Ends in Mate', family: 'Checks', rule: 'The last move is checkmate', test: (m) => m.mate === true, evidence: (m) => `${m.name} ends in checkmate` },

  { id: 'queen-out-early', name: 'Queen Out Early', family: 'Early queen', rule: 'A queen move within the first 6 half-moves', test: (m) => m.queenEarly === true, evidence: (m) => `${m.name} moves the queen early` },
  { id: 'king-walk', name: 'King Walk', family: 'King walk', rule: 'The line includes a king move (castling does not count)', test: (m) => m.kingWalk === true, evidence: (m) => `${m.name} moves the king` },
  { id: 'rook-move', name: 'Rook Move', family: 'Rook move', rule: 'The line includes a rook move', test: (m) => m.rookMove === true, evidence: (m) => `${m.name} moves a rook` },
  { id: 'pawn-storm', name: 'Pawn Storm', family: 'Pawn only', rule: 'A line of 4 or more half-moves made only with pawns', test: (m) => m.pawnsOnly === true && m.plies >= 4, evidence: (m) => `${m.name} uses only pawn moves for ${m.plies} half-moves` },

  { id: 'ends-on-white', name: 'Ends on White', family: 'Last move', rule: 'The last half-move is White’s (an odd count)', test: (m) => m.plies !== null && m.plies % 2 === 1, evidence: ply },
  { id: 'ends-on-black', name: 'Ends on Black', family: 'Last move', rule: 'The last half-move is Black’s (an even count)', test: (m) => m.plies !== null && m.plies % 2 === 0, evidence: ply },

  { id: 'gambit', name: 'Gambit', family: 'Name word', rule: 'Name contains "Gambit"', test: word(/\bgambit\b/), evidence: nm },
  { id: 'attack', name: 'Attack', family: 'Name word', rule: 'Name contains "Attack"', test: word(/\battack\b/), evidence: nm },
  { id: 'system', name: 'System', family: 'Name word', rule: 'Name contains "System"', test: word(/\bsystem\b/), evidence: nm },
  { id: 'counter', name: 'Counter', family: 'Name word', rule: 'Name contains "Counter" (Counterattack, Countergambit)', test: word(/\bcounter/), evidence: nm },
  { id: 'main-line', name: 'Main Line', family: 'Name word', rule: 'Name contains "Main Line"', test: word(/\bmain line\b/), evidence: nm },
  { id: 'trap', name: 'Trap', family: 'Name word', rule: 'Name contains "Trap"', test: word(/\btrap\b/), evidence: nm },
  { id: 'accepted', name: 'Accepted', family: 'Offer outcome', rule: 'Name contains "Accepted"', test: word(/\baccepted\b/), evidence: nm },
  { id: 'declined', name: 'Declined', family: 'Offer outcome', rule: 'Name contains "Declined"', test: word(/\bdeclined\b/), evidence: nm },

  { id: 'sicilian', name: 'Sicilian', family: 'Famous family', rule: 'Name contains "Sicilian"', test: fam(/\bsicilian\b/), evidence: nm },
  { id: 'ruy-lopez', name: 'Ruy Lopez', family: 'Famous family', rule: 'Name contains "Ruy Lopez" or "Spanish"', test: fam(/\bruy lopez\b|\bspanish\b/), evidence: nm },
  { id: 'french', name: 'French', family: 'Famous family', rule: 'Name contains "French"', test: fam(/\bfrench\b/), evidence: nm },
  { id: 'italian', name: 'Italian', family: 'Famous family', rule: 'Name contains "Italian"', test: fam(/\bitalian\b/), evidence: nm },
  { id: 'queens-gambit', name: 'Queen’s Gambit', family: 'Famous family', rule: 'Name contains "Queen’s Gambit"', test: fam(/\bqueen['’]s gambit\b/), evidence: nm },
  { id: 'kings-gambit', name: 'King’s Gambit', family: 'Famous family', rule: 'Name contains "King’s Gambit"', test: fam(/\bking['’]s gambit\b/), evidence: nm },
  { id: 'english', name: 'English', family: 'Famous family', rule: 'Name contains "English"', test: fam(/\benglish\b/), evidence: nm },
  { id: 'indian', name: 'Indian', family: 'Famous family', rule: 'Name contains "Indian"', test: fam(/\bindian\b/), evidence: nm },
  { id: 'caro-kann', name: 'Caro-Kann', family: 'Famous family', rule: 'Name contains "Caro-Kann"', test: fam(/\bcaro-kann\b/), evidence: nm },
  { id: 'scandinavian', name: 'Scandinavian', family: 'Famous family', rule: 'Name contains "Scandinavian"', test: fam(/\bscandinavian\b/), evidence: nm },
  { id: 'dutch', name: 'Dutch', family: 'Famous family', rule: 'Name contains "Dutch"', test: fam(/\bdutch\b/), evidence: nm },
  { id: 'catalan', name: 'Catalan', family: 'Famous family', rule: 'Name contains "Catalan"', test: fam(/\bcatalan\b/), evidence: nm },
  { id: 'alekhine', name: 'Alekhine', family: 'Famous family', rule: 'Name contains "Alekhine"', test: fam(/\balekhine/), evidence: nm },
  { id: 'pirc', name: 'Pirc', family: 'Famous family', rule: 'Name contains "Pirc"', test: fam(/\bpirc\b/), evidence: nm },
  { id: 'london', name: 'London', family: 'Famous family', rule: 'Name contains "London"', test: fam(/\blondon\b/), evidence: nm },

  { id: 'possessive-name', name: 'Possessive Name', family: 'Apostrophe', rule: 'Name contains an apostrophe', test: (m) => m.n !== null && /['’]/.test(m.n), evidence: nm },
  { id: 'hyphenated-name', name: 'Hyphenated Name', family: 'Hyphen', rule: 'Name contains a hyphen', test: (m) => m.n !== null && m.n.includes('-'), evidence: nm },
  { id: 'accented-name', name: 'Accented Name', family: 'Accent', rule: 'Name contains a letter outside plain ASCII', test: (m) => m.n !== null && /[^\u0000-\u007f]/.test(m.n.replace(/’/g, "'")), evidence: nm },
  { id: 'numbered-name', name: 'Numbered Name', family: 'Digits', rule: 'Name contains a digit 0-9', test: (m) => m.n !== null && /[0-9]/.test(m.n), evidence: (m) => `${nm(m)} contains a digit` },
  { id: 'long-title', name: 'Long Title', family: 'Title length', rule: 'Name of 70 characters or more', test: (m) => m.n !== null && chars(m.n).length >= 70, evidence: (m) => `${nm(m)} has ${chars(m.n).length} characters` },
  { id: 'short-title', name: 'Short Title', family: 'Title length', rule: 'Name of 12 characters or fewer', test: (m) => m.n !== null && chars(m.n).length <= 12, evidence: (m) => `${nm(m)} has ${chars(m.n).length} characters` },
  { id: 'comma-chain', name: 'Comma Chain', family: 'Sub-lines', rule: 'Name has two or more commas (sub-lines of sub-lines)', test: (m) => m.n !== null && (m.n.match(/,/g) || []).length >= 2, evidence: nm },
  { id: 'family-line', name: 'Family Line', family: 'Plain name', rule: 'Name has no colon: the named family itself, not a variation of it', test: (m) => m.n !== null && !m.n.includes(':'), evidence: nm },
];
