import { spawn, spawnSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const LIB_DIR = join(__dirname, 'lib');
const SRC_DIR = join(__dirname, 'src');
const IMAGE = 'eclipse-temurin:21-jdk';

const JARS = [
  {
    name: 'org.eclipse.emf.henshin.model_1.8.0.202302121604.jar',
    url: 'https://download.eclipse.org/modeling/emft/henshin/updates/release/plugins/org.eclipse.emf.henshin.model_1.8.0.202302121604.jar'
  },
  {
    name: 'org.eclipse.emf.henshin.interpreter_1.8.0.202302121604.jar',
    url: 'https://download.eclipse.org/modeling/emft/henshin/updates/release/plugins/org.eclipse.emf.henshin.interpreter_1.8.0.202302121604.jar'
  },
  {
    name: 'org.eclipse.emf.common_2.30.0.jar',
    url: 'https://repo1.maven.org/maven2/org/eclipse/emf/org.eclipse.emf.common/2.30.0/org.eclipse.emf.common-2.30.0.jar'
  },
  {
    name: 'org.eclipse.emf.ecore_2.36.0.jar',
    url: 'https://repo1.maven.org/maven2/org/eclipse/emf/org.eclipse.emf.ecore/2.36.0/org.eclipse.emf.ecore-2.36.0.jar'
  },
  {
    name: 'org.eclipse.emf.ecore.xmi_2.37.0.jar',
    url: 'https://repo1.maven.org/maven2/org/eclipse/emf/org.eclipse.emf.ecore.xmi/2.37.0/org.eclipse.emf.ecore.xmi-2.37.0.jar'
  },
  {
    name: 'nashorn-core-15.4.jar',
    url: 'https://repo1.maven.org/maven2/org/openjdk/nashorn/nashorn-core/15.4/nashorn-core-15.4.jar'
  },
  {
    name: 'asm-9.5.jar',
    url: 'https://repo1.maven.org/maven2/org/ow2/asm/asm/9.5/asm-9.5.jar'
  },
  {
    name: 'asm-commons-9.5.jar',
    url: 'https://repo1.maven.org/maven2/org/ow2/asm/asm-commons/9.5/asm-commons-9.5.jar'
  },
  {
    name: 'asm-tree-9.5.jar',
    url: 'https://repo1.maven.org/maven2/org/ow2/asm/asm-tree/9.5/asm-tree-9.5.jar'
  },
  {
    name: 'asm-util-9.5.jar',
    url: 'https://repo1.maven.org/maven2/org/ow2/asm/asm-util/9.5/asm-util-9.5.jar'
  }
];

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
  if (!existsSync(hostPath)) {
    return hostPath; // Keep literal strings or rule names untouched
  }
  const absPath = resolve(hostPath);
  if (absPath.startsWith(REPO_ROOT)) {
    return '/workspace/' + relative(REPO_ROOT, absPath).replace(/\\/g, '/');
  }
  return absPath.replace(/\\/g, '/');
}

async function setup({ forceDocker = false } = {}) {
  if (!existsSync(LIB_DIR)) mkdirSync(LIB_DIR);

  for (const jar of JARS) {
    const jarPath = join(LIB_DIR, jar.name);
    if (!existsSync(jarPath)) {
      console.log(`Downloading ${jar.name}...`);
      const response = await fetch(jar.url);
      if (!response.ok) throw new Error(`Failed to download ${jar.name}: ${response.statusText}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      writeFileSync(jarPath, buffer);
    }
  }

  const useDocker = forceDocker || !hasLocalJavac();

  if (useDocker) {
    if (!isDockerAvailable()) {
      throw new Error('Neither local javac nor Docker is available. Install JDK or start Docker Desktop.');
    }
    console.log('Compiling HenshinValidator.java inside Docker...');
    const dockerArgs = [
      'run', '--rm',
      '-v', `${REPO_ROOT}:/workspace`,
      '-w', '/workspace',
      IMAGE,
      'javac', '-cp', 'tools/henshin-validator/lib/*', '-d', 'tools/henshin-validator/lib', 'tools/henshin-validator/src/HenshinValidator.java'
    ];
    return new Promise((resolvePromise, reject) => {
      const proc = spawn('docker', dockerArgs, { stdio: 'inherit' });
      proc.on('close', (code) => {
        if (code === 0) resolvePromise();
        else reject(new Error(`javac in Docker failed with code ${code}`));
      });
    });
  } else {
    console.log('Compiling HenshinValidator.java locally...');
    const classpath = join(LIB_DIR, '*');
    const javac = spawn('javac', ['-cp', classpath, '-d', LIB_DIR, join(SRC_DIR, 'HenshinValidator.java')]);
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
    const dockerArgs = args.map(arg => (arg.startsWith('--') || arg.startsWith('-')) ? arg : dockerizePath(arg));
    const commandArgs = [
      'run', '--rm',
      '-v', `${REPO_ROOT}:/workspace`,
      '-w', '/workspace',
      IMAGE,
      'java', '-cp', 'tools/henshin-validator/lib/*:tools/henshin-validator/lib', 'HenshinValidator', ...dockerArgs
    ];
    proc = spawn('docker', commandArgs);
  } else {
    const sep = process.platform === 'win32' ? ';' : ':';
    const classpath = join(LIB_DIR, '*') + sep + LIB_DIR;
    proc = spawn('java', ['-cp', classpath, 'HenshinValidator', ...args]);
  }

  proc.stdout.on('data', (data) => process.stdout.write(data));
  proc.stderr.on('data', (data) => process.stderr.write(data));

  return new Promise((resolvePromise) => {
    proc.on('close', (code) => resolvePromise(code ?? 1));
  });
}

const rawArgs = process.argv.slice(2);
const forceDocker = rawArgs.includes('--docker');
const args = rawArgs.filter((arg) => arg !== '--docker');

if (args.includes('--setup')) {
  await setup({ forceDocker });
} else {
  if (!existsSync(join(LIB_DIR, 'HenshinValidator.class'))) {
    await setup({ forceDocker });
  }
  const code = await run(args, { forceDocker });
  process.exit(code);
}
