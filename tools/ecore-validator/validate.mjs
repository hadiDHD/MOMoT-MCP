import { spawn, spawnSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const LIB_DIR = join(__dirname, 'lib');
const SRC_DIR = join(__dirname, 'src');
const IMAGE = 'eclipse-temurin:21-jdk';

function isDockerAvailable() {
  try {
    const res = spawnSync('docker', ['info'], { stdio: 'ignore' });
    return res.status === 0;
  } catch {
    return false;
  }
}

function hasLocalJava() {
  try {
    const res = spawnSync('java', ['-version'], { stdio: 'ignore' });
    return res.status === 0;
  } catch {
    return false;
  }
}

function hasLocalJavac() {
  try {
    const res = spawnSync('javac', ['-version'], { stdio: 'ignore' });
    return res.status === 0;
  } catch {
    return false;
  }
}

function dockerizePath(hostPath) {
  const absPath = resolve(hostPath);
  if (absPath.startsWith(REPO_ROOT)) {
    return '/workspace/' + relative(REPO_ROOT, absPath).replace(/\\/g, '/');
  }
  return absPath.replace(/\\/g, '/');
}

async function setup({ forceDocker = false } = {}) {
  if (!existsSync(LIB_DIR)) mkdirSync(LIB_DIR);

  const useDocker = forceDocker || !hasLocalJavac();

  if (useDocker) {
    if (!isDockerAvailable()) {
      throw new Error('Neither local javac nor Docker is available. Install JDK or start Docker Desktop.');
    }
    console.log('Compiling EcoreValidator.java inside Docker...');
    const dockerArgs = [
      'run', '--rm',
      '-v', `${REPO_ROOT}:/workspace`,
      '-w', '/workspace',
      IMAGE,
      'javac', '-cp', 'tools/ecore-validator/lib/*', '-d', 'tools/ecore-validator/lib', 'tools/ecore-validator/src/EcoreValidator.java'
    ];
    return new Promise((resolvePromise, reject) => {
      const proc = spawn('docker', dockerArgs, { stdio: 'inherit' });
      proc.on('close', (code) => {
        if (code === 0) resolvePromise();
        else reject(new Error(`javac in Docker failed with code ${code}`));
      });
    });
  } else {
    console.log('Compiling EcoreValidator.java locally...');
    const classpath = join(LIB_DIR, '*');
    const javac = spawn('javac', ['-cp', classpath, '-d', LIB_DIR, join(SRC_DIR, 'EcoreValidator.java')]);
    return new Promise((resolvePromise, reject) => {
      javac.on('close', (code) => {
        if (code === 0) resolvePromise();
        else reject(new Error(`javac failed with code ${code}`));
      });
    });
  }
}

async function run(args, { forceDocker = false } = {}) {
  const useDocker = forceDocker || !hasLocalJava();

  let proc;
  if (useDocker) {
    if (!isDockerAvailable()) {
      throw new Error('Docker is not available. Install JDK or start Docker Desktop.');
    }
    const dockerArgs = args.map(arg => arg.startsWith('--') ? arg : dockerizePath(arg));
    const commandArgs = [
      'run', '--rm',
      '-v', `${REPO_ROOT}:/workspace`,
      '-w', '/workspace',
      IMAGE,
      'java', '-cp', 'tools/ecore-validator/lib/*:tools/ecore-validator/lib', 'EcoreValidator', ...dockerArgs
    ];
    proc = spawn('docker', commandArgs);
  } else {
    const sep = process.platform === 'win32' ? ';' : ':';
    const classpath = join(LIB_DIR, '*') + sep + LIB_DIR;
    proc = spawn('java', ['-cp', classpath, 'EcoreValidator', ...args]);
  }

  let stdout = '';
  let stderr = '';

  proc.stdout.on('data', (data) => { stdout += data; });
  proc.stderr.on('data', (data) => { stderr += data; });

  return new Promise((resolvePromise) => {
    proc.on('close', (code) => {
      if (stdout.trim()) {
        process.stdout.write(stdout.trim() + '\n');
      } else if (stderr.trim()) {
        console.log(JSON.stringify({ success: false, errors: [stderr.trim()], warnings: [], tier: 'structure' }));
      } else {
        console.log(JSON.stringify({ success: false, errors: [`EcoreValidator exited with code ${code}`], warnings: [], tier: 'structure' }));
      }
      resolvePromise(code);
    });
  });
}

const rawArgs = process.argv.slice(2);
const forceDocker = rawArgs.includes('--docker');
const args = rawArgs.filter((arg) => arg !== '--docker');

if (args.includes('--setup')) {
  await setup({ forceDocker });
} else {
  if (!existsSync(join(LIB_DIR, 'EcoreValidator.class'))) {
    await setup({ forceDocker });
  }
  const code = await run(args, { forceDocker });
  process.exit(code);
}
