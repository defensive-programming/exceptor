import { select } from '@inquirer/prompts';

await select({
  message: 'Have you updated the README.md?',
  choices: [
    { name: 'Yes', value: 0 },
    { name: 'No', value: 1 }
  ]
})
.then((e: number) => Deno.exit(e));

