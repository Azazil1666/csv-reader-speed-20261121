import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setFlagsFromString } from 'node:v8';

setFlagsFromString('--no-incremental-marking');
const { run } = await import(new URL('./solve.js', import.meta.url).href);
const source = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const destination = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const cases = JSON.parse(readFileSync(join(source, 'cases.json'), 'utf8'));
const answers = new Array(cases.length);
for (let i = 0; i < cases.length; i++) answers[i] = run(cases[i].input);
writeFileSync(join(destination, 'answers.json'), JSON.stringify(answers));
