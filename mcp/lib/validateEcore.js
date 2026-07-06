import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Validate Ecore using local CLI validator
 */
export async function validateEcore({ ecorePath, mode = 'structure' }) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const validatorScript = path.join(repoRoot, 'tools', 'ecore-validator', 'validate.mjs');

  if (!fs.existsSync(validatorScript)) {
    return { success: false, errors: [`Validator not found at ${validatorScript}.`] };
  }

  const args = [];
  if (mode === 'structure') {
    args.push('--validate-structure', ecorePath);
  } else {
    args.push('--validate-semantic', ecorePath);
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
