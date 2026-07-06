# Java-Helpers Wiki — Chapter 01: Custom Fitness Functions

This chapter describes how to implement custom fitness functions by extending the MOMoT fitness API. Custom fitness functions navigate the EMF model graph dynamically to compute specific multi-objective metrics.

## The Base Class: `AbstractEGraphFitness`

Every custom fitness class must inherit from `at.ac.tuwien.big.momot.search.fitness.AbstractEGraphFitness`. This class binds into the MOMoT execution pipeline and implements the `IFitnessDimension` interface.

## Canonical Template

```java
package mypackage;

import at.ac.tuwien.big.momot.search.fitness.AbstractEGraphFitness;
import at.ac.tuwien.big.momot.problem.solution.TransformationSolution;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.henshin.interpreter.EGraph;

import java.util.List;

public class MyDomainFitness extends AbstractEGraphFitness {

    @Override
    public double[] evaluate(TransformationSolution solution) {
        EGraph graph = solution.getModel();
        
        // Safety check: verify the graph contains elements
        if (graph.getRoots().isEmpty()) {
            return new double[]{ 0.0 };
        }
        
        // Retrieve the single containment root object
        EObject root = graph.getRoots().get(0);
        
        // Compute the objective value using custom logic
        double objectiveValue = computeObjective(root);
        
        // Return objective array (one double element per declared dimension)
        return new double[]{ objectiveValue };
    }

    private double computeObjective(EObject root) {
        // Domain-specific logic
        return 42.0;
    }
}
```

## Model Navigation API

To extract values and traverse associations inside your custom fitness, use EMF's reflexive `EObject` interface:

- **Root Access**: `graph.getRoots()` returns a `List<EObject>`. In MOMoT, the first root is the single containment container.
- **Reading Attributes**: `eGet(EStructuralFeature)` reads attributes.
  `String name = (String) task.eGet(task.eClass().getEStructuralFeature("name"));`
- **Navigating Multi-Valued References**: Multi-valued associations are returned as `EList<?>`. Cast them to iterate:
  `EList<EObject> tasks = (EList<EObject>) machine.eGet(machine.eClass().getEStructuralFeature("tasks"));`
- **Dynamic Casing**: When compiled against the generated domain package, cast elements to their actual generated types (e.g., `((Task) task).getDuration()`) which avoids complex feature lookups and reflection.

## Verification Checklist

- [ ] Class extends `AbstractEGraphFitness`.
- [ ] Overridden `evaluate` method accepts `TransformationSolution` and returns `double[]`.
- [ ] Returned `double[]` has the correct length.
- [ ] Package name matches folder structure.
- [ ] `graph.getRoots()` is guarded against empty graphs.
- [ ] Casts to EAttributes are checked for correct type safety.
