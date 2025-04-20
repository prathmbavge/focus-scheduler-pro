import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';
import { rimraf } from 'rimraf';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const patterns = [
  'node_modules/.vite',
  'node_modules/.vite/deps_temp*'
];

async function cleanup() {
  try {
    for (const pattern of patterns) {
      const matches = await glob(pattern, { cwd: __dirname });
      for (const match of matches) {
        const fullPath = path.resolve(__dirname, match);
        console.log(`Attempting to remove ${fullPath}`);
        await rimraf(fullPath);
      }
    }
    console.log('Cleanup completed');
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

cleanup();
