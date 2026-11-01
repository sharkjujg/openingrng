#!/usr/bin/env python3
"""Build data/pool-v1.json from the lichess-org chess-openings collection (CC0: https://github.com/lichess-org/chess-openings).

Each row of a.tsv ... e.tsv is an ECO code, an opening name and the moves that reach it ("1. e4 e5 2. f4"). The moves are stored
as plain move notation without move numbers ("e4 e5 f4"). A row whose moves are not valid move notation is a data error and stops
the build rather than being guessed at. Names repeat across different move orders, so the id is the ECO code plus the row's
position within that code, not the name.

Usage:
  mkdir dl && cd dl
  for f in a b c d e; do curl -LO https://raw.githubusercontent.com/lichess-org/chess-openings/master/$f.tsv; done
  python tools/import_openings.py dl     (from the repository root; run tools/test_import.py first)
"""
import csv
import datetime as dt
import json
import pathlib
import re
import sys

SAN = re.compile(r"(O-O(-O)?|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](=[QRBN])?)[+#]?")
ECO = re.compile(r"[A-E][0-9]{2}")


def moves_of(pgn):
    toks = re.sub(r"\d+\.(\.\.)?", " ", pgn).split()
    for t in toks:
        if not SAN.fullmatch(t):
            raise ValueError(f"not a move: {t!r} in {pgn!r}")
    return toks


def convert(rows):
    seq, out, seen = {}, [], set()
    for r in rows:
        eco, name, pgn = r["eco"].strip(), r["name"].strip(), r["pgn"].strip()
        if not ECO.fullmatch(eco) or not name:
            raise ValueError(f"bad row: {r!r}")
        toks = moves_of(pgn)
        if not toks or tuple(toks) in seen:
            continue  # an empty line or the same moves listed twice is not a second opening
        seen.add(tuple(toks))
        seq[eco] = seq.get(eco, 0) + 1
        out.append({"id": f"{eco}-{seq[eco]}", "eco": eco, "name": name, "moves": " ".join(toks)})
    return out


def main(folder):
    d = pathlib.Path(folder)
    rows = []
    for f in "abcde":
        rows += list(csv.DictReader(open(d / f"{f}.tsv", encoding="utf-8", newline=""), delimiter="\t"))
    members = convert(rows)
    n, today = len(members), dt.datetime.now(dt.timezone.utc).date().isoformat()
    meta = {"version": "v1", "publishedAt": today, "capturedAt": today, "source": "lichess-org/chess-openings, CC0 (https://github.com/lichess-org/chess-openings)",
            "provenance": f"Snapshot of the lichess-org chess-openings TSV files taken {today}, converted by tools/import_openings.py. Facts only; no diagrams.",
            "selection": "Every named opening line in the collection, one per distinct move sequence.",
            "fieldStatus": {"id": "known (ECO code and position within it)", "eco": "known (ECO classification code)", "name": "known (names repeat across move orders)",
                            "moves": "known (the line's moves in standard notation, without move numbers; the first move is White's)"}}
    lines = ",\n".join("  " + json.dumps(m, ensure_ascii=False, separators=(",", ":")) for m in members)
    out = pathlib.Path(__file__).resolve().parent.parent / "data" / "pool-v1.json"
    out.parent.mkdir(exist_ok=True)
    out.write_bytes(('{"meta":' + json.dumps(meta, ensure_ascii=False) + ',\n"members":[\n' + lines + "\n]}\n").encode("utf-8"))
    print(f"wrote {out}: {n} openings")


if __name__ == "__main__":
    main(sys.argv[1])
