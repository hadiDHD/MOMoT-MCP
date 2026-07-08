import fs from 'node:fs';
import path from 'node:path';

/**
 * Validates a Java helper fitness class.
 * Performs deep static structural and syntax analysis to ensure correctness.
 */
export async function validateJavaHelper({ javaPath, javaContent }) {
  let content = javaContent;
  let finalPath = javaPath;

  if (!content && javaPath) {
    const resolved = path.resolve(process.cwd(), javaPath);
    if (fs.existsSync(resolved)) {
      content = fs.readFileSync(resolved, 'utf8');
    } else {
      return {
        success: false,
        pass: false,
        errors: [`Java helper file not found at: ${javaPath}`],
        warnings: []
      };
    }
  }

  if (!content) {
    return {
      success: false,
      pass: false,
      errors: ['Provide either javaPath or javaContent.'],
      warnings: []
    };
  }

  const errors = [];
  const warnings = [];

  // 1. Verify package declaration
  const packageMatch = content.match(/package\s+([a-zA-Z0-9_\.]+);/);
  if (!packageMatch) {
    errors.push('Missing package declaration in Java helper class.');
  }

  // 2. Identify Class name and verify inheritance
  const classMatch = content.match(/public\s+class\s+([a-zA-Z0-9_]+)/);
  if (!classMatch) {
    errors.push('Missing or invalid public class declaration.');
  } else {
    const className = classMatch[1];
    
    // Check if class name matches the filename
    if (finalPath) {
      const baseName = path.basename(finalPath, '.java');
      if (baseName !== className) {
        errors.push(`Public class name '${className}' must match file name '${baseName}'.`);
      }
    }

    // Verify inheritance from AbstractEGraphFitness
    const extendsMatch = content.match(new RegExp(`public\\s+class\\s+${className}\\s+extends\\s+([a-zA-Z0-9_]+)`));
    if (!extendsMatch || extendsMatch[1] !== 'AbstractEGraphFitness') {
      errors.push(`Class '${className}' must directly extend 'AbstractEGraphFitness'.`);
    }
  }

  // 3. Verify evaluate method implementation
  const evaluateMatch = content.match(/\bdouble\s*\[\s*\]\s+evaluate\s*\(\s*TransformationSolution\s+[a-zA-Z0-9_]+\s*\)/);
  if (!evaluateMatch) {
    errors.push("Missing or incorrectly signatured 'evaluate(TransformationSolution solution)' method. " +
                "Expected signature: 'public double[] evaluate(TransformationSolution solution)'");
  }

  // 4. Verify necessary MOMoT and EMF imports
  const fitnessImport = content.includes('at.ac.tuwien.big.momot.search.fitness.AbstractEGraphFitness');
  const solutionImport = content.includes('at.ac.tuwien.big.momot.problem.solution.TransformationSolution');
  const egraphImport = content.includes('org.eclipse.emf.henshin.interpreter.EGraph');

  if (!fitnessImport) {
    warnings.push("Missing recommended import for 'at.ac.tuwien.big.momot.search.fitness.AbstractEGraphFitness'.");
  }
  if (!solutionImport) {
    warnings.push("Missing recommended import for 'at.ac.tuwien.big.momot.problem.solution.TransformationSolution'.");
  }
  if (!egraphImport) {
    warnings.push("Missing recommended import for 'org.eclipse.emf.henshin.interpreter.EGraph' (highly recommended for graph model queries).");
  }

  // 5. Basic brace matching verification
  let braceCount = 0;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    else if (content[i] === '}') braceCount--;
  }
  if (braceCount !== 0) {
    errors.push('Mismatched curly braces in the Java file. Code structure is invalid.');
  }

  const pass = errors.length === 0;

  return {
    success: pass,
    pass,
    errors,
    warnings,
    tier: 'static-conformance'
  };
}
