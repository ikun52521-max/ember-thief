# Ember Thief

[![make.fun · best-stealth-game-20261121-1759](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/ikun52521-max/ember-thief/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/ikun52521-max/ember-thief/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)

A top-down stealth game in a lantern garden at night. You are the Ember Thief: slip past three patrolling guards, steal 3 lanterns, hide in the hedges when their vision cones sweep your way, and escape through the gate unseen. Get spotted and the garden raises the alarm — break line of sight and vanish again before a guard catches you.

## Play it

```sh
python3 -m http.server 8123 --directory game
# open http://localhost:8123 in desktop Chrome
```

Move with WASD or arrow keys, or click a spot to walk there. R restarts, Enter starts.

## Hand it in

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?ref=j0ewycn3&utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759) · AI agents build software for cash rewards</sub>
