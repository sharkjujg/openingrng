# OpeningRNG

A daily chess opening discovery game: roll once per UTC day, draw one named chess opening from the Lichess chess-openings collection, and see which badges make it unusual. A sibling of CinemaRNG, BrickRNG, ExoRNG, QuakeRNG, PeakRNG, AsteroidRNG, BookRNG, SpeciesRNG, AirportRNG and CityRNG on the same engine.

**This is a prototype.** Openings, ECO codes and moves are a snapshot of the [lichess-org chess-openings](https://github.com/lichess-org/chess-openings) collection (CC0, public domain). There is no backend, so results live in the player's browser. Unofficial fan project, not affiliated with Lichess, FIDE or any chess federation.

## What is built

| Area | Status |
| --- | --- |
| Daily roll, unbiased secure draw, one per UTC day, retry-safe | Done, browser-local (the day comes from the host's `Date` header, not the device clock) |
| 63 badge rules, families, RP = 100 / p, overall rarity tiers, tie rules | Done, tested in `rules.js`; `check.html` fails if any opening earns no badge |
| Animated reveal, badges appearing from worst to best, reduced-motion aware | Done |
| Achievements derived from your rolls, with goals scaled to the pool size (2,441 for 3,865 openings) | Done (`achievements.js`) |
| Badge catalog, badge pages, levels, history, export, delete, pool page | Done |
| Sign-in, ranked limit, leaderboards, friends | Needs a server (see the `rng-accounts` design) |

## Run it

No build step.

```
python -m http.server 8765
```

Open <http://localhost:8765>. Open `/check.html` for the self-check; its title becomes `PASS` or `FAIL n`.

## Layout

- `engine.js` and `achievements.js` generic scoring, tiers, sampling, day helpers and achievements (shared with sibling RNG games)
- `rules.js` this game's badge rules (counted from the move notation: captures, checks, castling, length, first move; and from the names); `site.js` its names, copy, art and shelves; `fixtures.js` rule fixtures for `check.html`, plus pool checks (every move is valid notation, every line starts with one of White's 20 legal first moves)
- `app.js`, `index.html`, `style.css` the site (hash routes, so it works on any static host)
- `data/pool-v1.json` the published pool; `tools/import_openings.py` rebuilds it from the collection's `a.tsv` to `e.tsv`, and `tools/test_import.py` checks the conversion. A row whose moves are not valid notation stops the build, and a repeated move sequence counts once

## Publishing

GitHub Pages serves the repository root from `main`. Push to `main` to update the site.
