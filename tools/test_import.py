#!/usr/bin/env python3
"""Check import_openings.py against a few hand-made rows. Usage: python tools/test_import.py"""
import import_openings as imp

rows = [
    {"eco": "B20", "name": "Sicilian Defense", "pgn": "1. e4 c5"},
    {"eco": "B20", "name": "Sicilian Defense: Bowdler Attack", "pgn": "1. e4 c5 2. Bc4"},
    {"eco": "B20", "name": "Sicilian Defense (again)", "pgn": "1. e4 c5"},  # the same moves twice: one opening
    {"eco": "C41", "name": "Philidor Defense", "pgn": "1. e4 e5 2. Nf3 d6 3. O-O"},
    {"eco": "A00", "name": "Amar Opening", "pgn": "1. Nh3"},
    {"eco": "C20", "name": "Scholar mate line", "pgn": "1. e4 e5 2. Qh5 Nc6 3. Bc4 g6 4. Qf3 Nf6 5. Qxf7#"},
]
got = imp.convert(rows)
assert [m["id"] for m in got] == ["B20-1", "B20-2", "C41-1", "A00-1", "C20-1"], [m["id"] for m in got]
assert got[1]["moves"] == "e4 c5 Bc4" and got[2]["moves"] == "e4 e5 Nf3 d6 O-O" and got[4]["moves"].endswith("Qxf7#"), got
for bad in ({"eco": "Z99", "name": "x", "pgn": "1. e4"}, {"eco": "A00", "name": "x", "pgn": "1. e9"}, {"eco": "A00", "name": "", "pgn": "1. e4"}):
    try:
        imp.convert([bad])
    except ValueError:
        continue
    raise AssertionError(f"accepted a bad row: {bad}")
print("OK")
