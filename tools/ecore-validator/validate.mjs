import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIB_DIR = join(__dirname, 'lib');
const SRC_DIR = join(__dirname, 'src');

async function setup() {
  if (!existsSync(LIB_DIR)) mkdirSync(LIB_DIR);

  // Compile Java EcoreValidator
  const sep = process.platform === 'win32' ? ';' : ':';
  const classpath = join(LIB_DIR, '*');
  const javac = spawn('javac', ['-cp', classpath, '-d', LIB_DIR, join(SRC_DIR, 'EcoreValidator.java')]);

  return new Promise((resolve, reject) => {
    javac.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`javac failed with code ${code}`));
      }
    });
  });
}

async function run(args) {
  const sep = process.platform === 'win32' ? ';' : ':';
  const classpath = join(LIB_DIR, '*') + sep + LIB_DIR;
  const java = spawn('java', ['-cp', classpath, 'EcoreValidator', ...args]);

  let stdout = '';
  let stderr = '';

  java.stdout.on('data', (data) => { stdout += data; });
  java.stderr.on('data', (data) => { stderr += data; });

  java.on('close', (code) => {
    if (stdout.trim()) {
      process.stdout.write(stdout.trim() + '\n');
    } else if (stderr.trim()) {
      console.log(JSON.stringify({ success: false, errors: [stderr.trim()], warnings: [], tier: 'structure' }));
    } else {
      console.log(JSON.stringify({ success: false, errors: [`EcoreValidator exited with code ${code}`], warnings: [], tier: 'structure' }));
    }
    process.exit(code);
  });
}

const args = process.argv.slice(2);
if (args.includes('--setup')) {
  await setup();
} else {
  if (!existsSync(join(LIB_DIR, 'EcoreValidator.class'))) {
    await setup();
  }
  await run(args);
}
