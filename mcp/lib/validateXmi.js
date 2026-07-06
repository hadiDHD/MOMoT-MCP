import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Validate XMI instance using local CLI validator
 */
export async function validateXmi({ xmiPath, mode = 'structure', ecorePath }) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const validatorScript = path.join(repoRoot, 'tools', 'xmi-validator', 'validate.mjs');

  if (!fs.existsSync(validatorScript)) {
    return { success: false, errors: [`Validator not found at ${validatorScript}.`] };
  }

  const args = [];
  if (mode === 'structure') {
    args.push('--validate-structure', xmiPath);
  } else if (mode === 'semantic') {
    if (!ecorePath) {
      return { success: false, errors: ['ecorePath is required for semantic mode'] };
    }
    args.push('--validate-semantic', xmiPath, '--ecore', ecorePath);
  } else if (mode === 'load') {
    if (!ecorePath) {
      return { success: false, errors: ['ecorePath is required for load mode'] };
    }
    args.push('--load', xmiPath, '--ecore', ecorePath);
  } else {
    return { success: false, errors: [`Unknown mode: ${mode}`] };
  }

  return new Promise((resolve) => {
    const proc = spawn('node', [validatorScript, ...args]);
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => { stdout += d; });
    proc.stderr.on('data', (d) => { stderr += d; });
    proc.on('close', (exitCode) => {
      let result = null;
      try {
        result = JSON.parse(stdout.trim());
      } catch {
        result = { success: exitCode === 0, errors: [stdout.trim() || stderr.trim() || 'Unknown error'] };
      }
      resolve({
        success: exitCode === 0,
        ...result
      });
    });
    proc.on('error', (err) => resolve({ success: false, errors: [String(err)] }));
  });
}
