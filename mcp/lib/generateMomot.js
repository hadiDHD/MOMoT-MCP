import fs from 'node:fs';
import path from 'node:path';
import { validateMomot } from '../lib.js';

export async function generateMomot({
  ecorePath,
  ecoreContent,
  modelPath,
  henshinPath,
  objectiveHints = [],
  packageName = 'generated.momot.search',
  className = 'GeneratedSearch',
  outputPath,
  validate = true
}) {
  const parsedPkgName = packageName || 'generated.momot.search';
  const parsedClassName = className || 'GeneratedSearch';

  const objectiveText = Array.isArray(objectiveHints) && objectiveHints.length > 0
    ? objectiveHints.join('; ')
    : 'Generated optimization scenario';

  // Substitution logic
  const momotContent = [
    `package ${parsedPkgName}`,
    '',
    // Keywords 'search' and 'fitness' are reserved in the MOMoT Xtext DSL,
    // so they must be escaped with '^' when appearing as segments of an
    // import FQN -- otherwise the DSL parser fails to resolve the type and
    // the Java code generator emits 'new Object()' as a fallback, causing
    // a compile-time type mismatch against IFitnessDimension. See issue #3.
    'import at.ac.tuwien.big.momot.^search.^fitness.dimension.TransformationLengthDimension',
    '',
    'search = {',
    '   model = {',
    `      file = "${modelPath}"`,
    '   }',
    '   solutionLength = 8',
    '   transformations = {',
    `      modules = [ "${henshinPath}" ]`,
    '   }',
    '   fitness = {',
    '      objectives = {',
    `         Objective : minimize { 0.0 } // ${escapeInlineComment(objectiveText)}`,
    '         SolutionLength : minimize new TransformationLengthDimension',
    '      }',
    '   }',
    '   algorithms = {',
    '      Random : moea.createRandomSearch()',
    '   }',
    '}',
    '',
    'experiment = {',
    '   populationSize = 20',
    '   maxEvaluations = 200',
    '   nrRuns = 1',
    '}',
    '',
    'results = {',
    '   models = {',
    '      outputDirectory = "out/models/"',
    '   }',
    '   objectives = {',
    '      outputFile = "out/objectives.txt"',
    '      printOutput',
    '   }',
    '}',
    ''
  ].join('\n');

  const finalOutputPath = outputPath || `src/${parsedPkgName.replace(/\./g, '/')}/${parsedClassName}.momot`;
  const resolvedPath = path.resolve(process.cwd(), finalOutputPath);

  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  fs.writeFileSync(resolvedPath, momotContent, 'utf8');

  let validationResult = {
    success: true,
    exitCode: 0,
    result: { valid: true }
  };

  if (validate) {
    validationResult = await validateMomot({
      momotPath: resolvedPath,
      mode: 'structure'
    });
  }

  return {
    success: true,
    momotContent,
    momotPath: finalOutputPath,
    validationResult
  };
}

function escapeInlineComment(value) {
  return String(value || '').replace(/[\r\n]/g, ' ').replace(/\*\//g, '* /');
}
