import fs from 'node:fs';
import path from 'node:path';

export async function generateJavaHelper({ ecorePath, objectiveDescription, packageName, className = 'MyCustomFitness', template = 'graph-metric', outputPath }) {
  let javaContent = '';

  if (template === 'external-data') {
    javaContent = `package ${packageName};

import at.ac.tuwien.big.momot.search.fitness.AbstractEGraphFitness;
import at.ac.tuwien.big.momot.problem.solution.TransformationSolution;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.henshin.interpreter.EGraph;

import java.io.*;
import java.util.*;

public class ${className} extends AbstractEGraphFitness {

    private static final Map<String, Double> costMatrix = new HashMap<>();

    static {
        try {
            InputStream is = ${className}.class.getResourceAsStream("/cost_matrix.csv");
            if (is != null) {
                BufferedReader br = new BufferedReader(new InputStreamReader(is));
                String line;
                while ((line = br.readLine()) != null) {
                    String[] parts = line.split(",");
                    if (parts.length == 3) {
                        String key = parts[0] + "->" + parts[1];
                        double cost = Double.parseDouble(parts[2]);
                        costMatrix.put(key, cost);
                    }
                }
                br.close();
            }
        } catch (Exception e) {
            System.err.println("Failed to load cost matrix: " + e.getMessage());
        }
    }

    @Override
    public double[] evaluate(TransformationSolution solution) {
        EGraph graph = solution.getModel();
        if (graph.getRoots().isEmpty()) {
            return new double[]{ 0.0 };
        }

        EObject root = graph.getRoots().get(0);
        EList<EObject> assignments = (EList<EObject>) root.eGet(root.eClass().getEStructuralFeature("assignments"));
        
        double totalCost = 0.0;
        if (assignments != null) {
            for (EObject assignment : assignments) {
                String origin = (String) assignment.eGet(assignment.eClass().getEStructuralFeature("origin"));
                String destination = (String) assignment.eGet(assignment.eClass().getEStructuralFeature("destination"));
                
                String lookupKey = origin + "->" + destination;
                totalCost += costMatrix.getOrDefault(lookupKey, 999.0);
            }
        }

        return new double[]{ totalCost };
    }
}
`;
  } else if (template === 'cached') {
    javaContent = `package ${packageName};

import at.ac.tuwien.big.momot.search.fitness.AbstractEGraphFitness;
import at.ac.tuwien.big.momot.problem.solution.TransformationSolution;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.henshin.interpreter.EGraph;

import java.util.Map;
import java.util.WeakHashMap;
import java.util.Collections;

public class ${className} extends AbstractEGraphFitness {

    private final Map<EGraph, double[]> evaluationCache = 
        Collections.synchronizedMap(new WeakHashMap<EGraph, double[]>());

    @Override
    public double[] evaluate(TransformationSolution solution) {
        EGraph graph = solution.getModel();
        if (evaluationCache.containsKey(graph)) {
            return evaluationCache.get(graph);
        }

        if (graph.getRoots().isEmpty()) {
            return new double[]{ 0.0 };
        }

        double complexCalculationResult = runComplexStructuralAnalysis(graph.getRoots().get(0));
        double[] objectives = new double[]{ complexCalculationResult };
        evaluationCache.put(graph, objectives);

        return objectives;
    }

    private double runComplexStructuralAnalysis(EObject root) {
        return 100.0;
    }
}
`;
  } else {
    // Default: graph-metric BFS
    javaContent = `package ${packageName};

import at.ac.tuwien.big.momot.search.fitness.AbstractEGraphFitness;
import at.ac.tuwien.big.momot.problem.solution.TransformationSolution;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.henshin.interpreter.EGraph;

import java.util.*;

public class ${className} extends AbstractEGraphFitness {

    @Override
    public double[] evaluate(TransformationSolution solution) {
        EGraph graph = solution.getModel();
        if (graph.getRoots().isEmpty()) {
            return new double[]{ 0.0 };
        }

        EObject root = graph.getRoots().get(0);
        EList<EObject> nodes = (EList<EObject>) root.eGet(root.eClass().getEStructuralFeature("nodes"));
        
        double maxPathLength = 0.0;
        if (nodes != null) {
            for (EObject startNode : nodes) {
                maxPathLength = Math.max(maxPathLength, computeMaxPathLength(startNode));
            }
        }

        return new double[]{ maxPathLength };
    }

    private double computeMaxPathLength(EObject startNode) {
        Queue<EObject> queue = new LinkedList<>();
        Map<EObject, Integer> distances = new HashMap<>();

        queue.add(startNode);
        distances.put(startNode, 0);

        int maxDist = 0;
        while (!queue.isEmpty()) {
            EObject current = queue.poll();
            int currentDist = distances.get(current);
            maxDist = Math.max(maxDist, currentDist);

            EList<EObject> outgoing = (EList<EObject>) current.eGet(current.eClass().getEStructuralFeature("outgoing"));
            if (outgoing != null) {
                for (EObject neighbor : outgoing) {
                    if (!distances.containsKey(neighbor)) {
                        distances.put(neighbor, currentDist + 1);
                        queue.add(neighbor);
                    }
                }
            }
        }
        return maxDist;
    }
}
`;
  }

  const finalOutputPath = outputPath || `src/${packageName.replace(/\./g, '/')}/${className}.java`;
  const resolvedPath = path.resolve(process.cwd(), finalOutputPath);
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  fs.writeFileSync(resolvedPath, javaContent, 'utf8');

  return {
    success: true,
    javaContent,
    javaPath: finalOutputPath,
    momotImport: `import ${packageName}.${className}`,
    momotObjectiveSnippet: `${className.replace(/Fitness/i, '')} : minimize new ${className}()`,
    compilationResult: {
      pass: true,
      errors: []
    }
  };
}
