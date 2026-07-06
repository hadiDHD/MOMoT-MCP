import fs from 'node:fs';
import path from 'node:path';
import { validateHenshin } from '../lib.js';

/**
 * Thin JS wrapper for the Henshin Sub-Agent delegation.
 * This function structurally documents the call path to agents/prompts/henshin-subagent.prompt.md.
 * In an interactive Cursor session, the LLM intercepts the rule/file work. At runtime/MCP level,
 * this function performs the validation loop of the sub-agent.
 */
export async function delegateToHenshinSubAgent({ ecorePath, modelPath, ruleName, nlDescription }) {
  const promptPath = path.resolve(process.cwd(), 'agents/prompts/henshin-subagent.prompt.md');
  
  // Verify that the prompt file exists to ensure call path integrity
  if (!fs.existsSync(promptPath)) {
    throw new Error(`Henshin Sub-Agent prompt file missing at: ${promptPath}`);
  }

  // Determine standard path for output henshin file
  const baseName = path.basename(ecorePath, '.ecore');
  const henshinPath = path.join(path.dirname(ecorePath), `${baseName}.henshin`);

  // If the file already exists, we validate it using our three-tier validator
  let validationResult = {
    structure: { pass: false, errors: ['Henshin file does not exist yet. Please run the generation flow in your Cursor agent.'] },
    semantic: { pass: false, errors: [] },
    apply: { pass: false, errors: [] }
  };

  if (fs.existsSync(henshinPath)) {
    // Tier 1: Structure
    const v1 = await validateHenshin({ henshinPath, mode: 'structure' });
    // Tier 2: Semantic
    const v2 = await validateHenshin({ henshinPath, mode: 'semantic', metamodelPath: ecorePath });
    // Tier 3: Apply
    const v3 = await validateHenshin({ henshinPath, mode: 'apply', metamodelPath: ecorePath, modelPath, ruleName });

    validationResult = {
      structure: { pass: v1.success, errors: v1.result?.errors || [] },
      semantic: { pass: v2.success, errors: v2.result?.errors || [] },
      apply: { pass: v3.success, errors: v3.result?.errors || [] }
    };
  }

  return {
    henshinPath,
    validationResult,
    promptReference: 'agents/prompts/henshin-subagent.prompt.md',
    nlDescription
  };
}
