[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Agus12341/best-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Agus12341/best-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

# Sunny Side Diner - a cozy cooking game

An entry for make.fun's [Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137) bounty.

Sunny Side Diner is a diner cooking game that plays offline in a desktop browser. Customer tickets print on the order board, each with a dish and a patience timer. You stack ingredients from the counter onto the plate - with the mouse or the number keys - until the plate matches the ticket, then serve it before the timer runs dry. Fast, correct serves build a combo multiplier; wrong dishes and walk-outs cost points, and the lunch rush speeds up as the 150-second shift goes on.

## Layout

- `main.ts` - the hand-in program (Node 22): copies `game/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored library.
- `vendor/makefun-game.ts` - the kit's library, unchanged.
- `game/` - the playable game as static files. Open `game/index.html` from any static server. Its source is split by job under `game/src/`: `config.js` (menu and tuning), `orders.js` (ticket spawning and ageing), `kitchen.js` (state, scoring, serving), `render.js` (drawing the diner), `input.js` (keyboard), `sound.js` (synthesized WebAudio sounds), `main.js` (boot and the shift clock).
- `screenshots/` - real renders of the game in a browser: the kitchen and order board, a dish mid-assembly, a ticket about to expire, and a plate ready to serve.

## Run it

Serve the `game/` folder with any static server, for example `python3 -m http.server -d game 8080`, then open http://localhost:8080.

Hand in: `MAKEFUN_OUTPUT_DIR=out node main.ts`

## License

MIT - see `LICENSE`.
