# MOMoT Wiki — Chapter 12: Java Helper Integration

This chapter describes how to integrate custom Java helper classes with your `.momot` search scripts. When OCL (Object Constraint Language) is structurally or computationally insufficient to express a complex fitness objective (such as calculating transitive closures, shortest paths, or communicating with external web services), you can implement a custom Java class and load it directly into the MOMoT execution runtime.

---

## The Compilation Classpath

When the `generate_artifacts_from_ecore` MCP tool is called with `includeJavaHelper: true`, or when you manually author helper classes:
1. The Java files (e.g., `*Fitness.java`, `*Helper.java`) must be placed in the `src/` directory matching their package structure (e.g., `src/mypackage/MyFitness.java`).
2. The headless REST runner compiles all Java sources under `src/` automatically during the pre-execution compilation phase (as logged in `runner/compile.log`).
3. Custom fitness classes must extend `AbstractEGraphFitness` from the MOMoT framework.

---

## Implementing `AbstractEGraphFitness`

Your Java helper must extend `at.ac.tuwien.big.momot.search.fitness.AbstractEGraphFitness` and implement the `evaluate(TransformationSolution)` method. This method accepts the current model graph solution and returns an array of objective doubles.

### Canonical Java Template

```java
package mypackage;

import at.ac.tuwien.big.momot.search.fitness.AbstractEGraphFitness;
import at.ac.tuwien.big.momot.search.solution.TransformationSolution;
import org.eclipse.emf.henshin.interpreter.EGraph;
import org.eclipse.emf.ecore.EObject;

public class CustomFitness extends AbstractEGraphFitness {
  
  @Override
  public double[] evaluate(TransformationSolution solution) {
    EGraph graph = solution.getModel();
    double customMetricValue = 0.0;
    
    // Iterate over EObjects in the solution graph
    for (EObject obj : graph) {
      if (obj.eClass().getName().equals("Task")) {
        int duration = (Integer) obj.eGet(obj.eClass().getEStructuralFeature("duration"));
        customMetricValue += duration;
      }
    }
    
    // Return array of objectives (one double per declared fitness dimension)
    return new double[] { customMetricValue };
  }
}
```

---

## Referencing Java Helper in `.momot`

To use the custom Java class inside your declarative MOMoT search script, import the FQN (Fully Qualified Name) and instantiate it within the `objectives` block under `fitness`.

```momot
package mypackage

import mypackage.CustomFitness

search = {
   model = { file = "model/input/model/model.xmi" }
   solutionLength = 10
   transformations = {
      modules = [ "model/scheduling.henshin" ]
   }
   fitness = {
      objectives = {
         CustomObjective : minimize new CustomFitness()
      }
   }
   algorithms = {
      Random : moea.createRandomSearch()
   }
}
```

## Common Errors

**Error:** `Compilation error: Symbol not found or Type mismatch`  
**Root cause:** The custom Java class has syntax errors, uses wrong package declarations, or does not exist under the correct path in the `src/` folder.  
**Fix:** Verify package names and class names align perfectly with the folder hierarchy under `src/`.

**Error:** `ClassCastException at evaluate`  
**Root cause:** `AbstractEGraphFitness` returned an array of a different length than expected by the objectives declared in the `.momot` file.  
**Fix:** Ensure the length of the returned `double[]` array equals the number of objectives mapped to this Java fitness class.

## Verification Checklist

- [ ] Java helper is placed under the matching package directory under `src/`.
- [ ] Helper class extends `AbstractEGraphFitness` and implements `evaluate`.
- [ ] Returned `double[]` matches objective length.
- [ ] Class is imported in the `.momot` script with its FQN.
- [ ] The Java file compiles without errors (refer to `runner/compile.log` upon failure).
