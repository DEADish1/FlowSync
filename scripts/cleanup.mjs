import { rm, mkdir, readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const removableTargets = [
  '.next',
  '.turbo',
  'dist',
  'build',
  'coverage',
  'out',
  'frontend/.next',
  'frontend/.turbo',
  'frontend/out',
  'frontend/dist',
  'frontend/build',
  'frontend/coverage',
  'frontend/.vercel',
  'backend/dist',
  'backend/build',
  'backend/coverage',
];

const directoriesToEmpty = ['backend/logs'];

async function removeTarget(relativePath) {
  const targetPath = path.join(rootDir, relativePath);
  await rm(targetPath, { recursive: true, force: true });
}

async function emptyDirectory(relativePath) {
  const dirPath = path.join(rootDir, relativePath);
  await mkdir(dirPath, { recursive: true });
  const entries = await readdir(dirPath, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.name !== '.gitignore')
      .map((entry) =>
        rm(path.join(dirPath, entry.name), { recursive: true, force: true })
      )
  );
}

async function main() {
  console.log('🧹 Cleaning project artifacts...\n');

  for (const target of removableTargets) {
    await removeTarget(target);
    console.log(`removed ${target}`);
  }

  for (const dir of directoriesToEmpty) {
    await emptyDirectory(dir);
    console.log(`emptied ${dir}`);
  }

  console.log('\n✨ Cleanup complete');
}

main().catch((error) => {
  console.error('Cleanup failed:', error);
  process.exitCode = 1;
});

