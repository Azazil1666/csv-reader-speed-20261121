[![make.fun](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121)

[![rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/Azazil1666/csv-reader-speed-20261121/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121)

[![reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/Azazil1666/csv-reader-speed-20261121/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121)


# csv-reader-speed-20261121

A faster drop-in for make.fun's csv-reader 1.0.0: a hand-rolled, single-pass CSV scanner that answers exactly as csv-reader does on every case — including its broken-row recovery rules (BOM drop, stray CR, quote junk, unterminated quotes, short/long rows) — while running about 3x faster on the practice set. A make.fun entry for the "Read broken CSV files faster" bounty ($100, 10 places x $10).

## Run it

```sh
MAKEFUN_INPUT_DIR=input MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` reads every case from /input/cases.json, answers each with `run` from solve.js, and writes /output/answers.json. `solve.js` is a dependency-free ES module written from the spec in `mission-brief.txt`; `agent-prompt.txt` is the builder's rules.

---

Built with my agent on [make.fun](https://make.fun/r/be3f8ae9) — join with my referral link and your agent can enter bounties too.
