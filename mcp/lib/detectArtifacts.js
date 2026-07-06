import fs from 'node:fs';
import path from 'node:path';

/**
 * Scan a directory + parse a prompt → return generation plan
 */
export async function detectArtifacts({ workspaceDir, userPrompt, dryRun = false }) {
  const resolvedDir = path.resolve(process.cwd(), workspaceDir);

  if (!fs.existsSync(resolvedDir)) {
    return {
      success: false,
      summary: `Workspace directory does not exist: ${workspaceDir}`,
      plan: [],
      dependenciesOk: false
    };
  }

  // Recursive directory scan helper
  const findFiles = (dir, ext) => {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(findFiles(fullPath, ext));
      } else if (file.endsWith(ext)) {
        results.push(path.relative(resolvedDir, fullPath));
      }
    }
    return results;
  };

  const ecores = findFiles(resolvedDir, '.ecore');
  const xmis = findFiles(resolvedDir, '.xmi');
  const henshins = findFiles(resolvedDir, '.henshin');
  const momots = findFiles(resolvedDir, '.momot');
  const javas = findFiles(resolvedDir, '.java').filter(f => f.endsWith('Helper.java') || f.endsWith('Fitness.java'));

  const presence = {
    ecore: ecores.length > 0,
    xmi: xmis.length > 0,
    henshin: henshins.length > 0,
    momot: momots.length > 0,
    java: javas.length > 0
  };

  const lcPrompt = (userPrompt || '').toLowerCase();
  
  // Keyword signals
  const signals = {
    ecore: /metamodel|ecore|class|entity|type/.test(lcPrompt),
    xmi: /instance|model|xmi|example|initial state/.test(lcPrompt),
    henshin: /rule|transformation|henshin|move|shift|reassign/.test(lcPrompt),
    momot: /search|optimize|objective|fitness|minimize|maximize/.test(lcPrompt),
    java: /java|helper|custom fitness|complex|external data/.test(lcPrompt)
  };

  // Determine needed flags based on signals or dependency closure
  const needed = {
    momot: signals.momot || lcPrompt.trim().length > 0, // default if prompt is present
    henshin: false,
    xmi: false,
    ecore: false,
    java: signals.java
  };

  if (needed.momot) {
    needed.henshin = true;
    needed.xmi = true;
    needed.ecore = true;
  }
  if (needed.java) {
    needed.ecore = true;
  }

  // Construct plan
  const plan = [];

  const types = ['ecore', 'xmi', 'henshin', 'momot', 'java'];
  const paths = {
    ecore: ecores[0] || 'model/domain.ecore',
    xmi: xmis[0] || 'model/input/model/model.xmi',
    henshin: henshins[0] || 'model/domain.henshin',
    momot: momots[0] || 'src/generated/search/SearchExample.momot',
    java: javas[0] || 'src/generated/search/CustomFitness.java'
  };

  for (const type of types) {
    let action = 'SKIP';
    let reason = 'Not needed for this problem context.';

    if (presence[type]) {
      action = 'VALIDATE';
      reason = 'File exists in workspace. Validate structure and semantics before use.';
    } else if (needed[type]) {
      action = 'GENERATE';
      reason = `File is missing but required by dependencies or signals in prompt.`;
    }

    // Skip java if not specified/needed
    if (type === 'java' && action === 'SKIP' && !signals.java) {
      continue;
    }

    plan.push({
      type,
      action,
      path: paths[type],
      reason
    });
  }

  const generatedCount = plan.filter(p => p.action === 'GENERATE').length;
  const validatedCount = plan.filter(p => p.action === 'VALIDATE').length;

  return {
    success: true,
    plan,
    summary: `${validatedCount} artifact(s) present, ${generatedCount} to generate.`,
    dependenciesOk: true
  };
}
