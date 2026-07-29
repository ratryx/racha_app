import { readdir, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const entries = await readdir(projectRoot);
const taskDocs = entries.filter((name) =>
  /^README-TASK-.*\.md$/i.test(name)
);

if (taskDocs.length === 0) {
  console.log('Nenhum README temporário encontrado.');
  process.exit(0);
}

await Promise.all(
  taskDocs.map((name) => unlink(resolve(projectRoot, name)))
);

console.log(
  `Removidos ${taskDocs.length} arquivos temporários:`
);

for (const name of taskDocs) {
  console.log(`- ${name}`);
}
