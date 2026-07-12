# Java-Helpers Wiki — Chapter 00: When Java Helpers Are Needed

This chapter describes how to decide whether to use standard OCL (Object Constraint Language) expressions or custom Java helper classes to implement your optimization objectives in MOMoT. While OCL is lightweight and fast, Java helpers are extremely powerful and can express complex algorithmic computations that OCL cannot natively model.

## The Decision Tree

Use the following questions to guide your selection:

```
Does the objective require:
  - Visiting graph elements and applying simple aggregations? → Use OCL (Fast, no classpath dependencies)
  - Recursive graph traversal (e.g., shortest-path, deep DFS)? → Use Java helper
  - Reading from external CSVs, databases, or API calls?       → Use Java helper
  - Caching previously computed graph evaluations?              → Use Java helper (Memoization)
  - String regex matching or complex text parsing?             → Use Java helper
  - Multi-step stateful or history-dependent math?             → Use Java helper
```

## When OCL is Sufficient

Do not introduce Java compilation overhead if OCL can naturally express the objective. OCL is perfectly sufficient for:
- Standard aggregations (e.g., `sum()`, `max()`, `min()`, `size()`).
- Filtering collections (e.g., `select()`, `reject()`, `exists()`).
- Projections (e.g., `collect(c | c.attribute)`).
- Arithmetic operations on EAttributes (e.g., `"nodes.load->max() - nodes.load->min()"`).

## When Java is Required

Custom Java classes are required in the following scenarios:
1. **Recursive Routing Algorithms**: Computing distance matrices using Dijkstra's or Bellman-Ford algorithms on network topologies.
2. **External Resource Lookups**: Cross-referencing task costs from an external SQLite database or loading travel costs from a flat CSV matrix.
3. **Memoization & Structural Caching**: Caching expensive fitness computations inside `WeakHashMap` instances keyed on EGraph states, preventing redundant evaluations of identical graphs.
4. **Stateful Accumulation**: Calculating fitness based on intermediate transformation steps rather than the final model state alone.

## Classpath Integration

No separate JAR is needed to package your Java helpers:
- Custom Java source files live under the `src/` directory in package-matching folder structures (e.g., `src/mypackage/MyFitness.java`).
- The MOMoT REST runner automatically compiles these classes along with the generated `.momot` search scripts.
- To use them, FQNs are imported and initialized inside the `.momot` script (see [docs/momot/12-java-helper-integration.md](../momot/12-java-helper-integration.md)).

## Verification Checklist

- [ ] Decision tree is consulted before writing any Java code.
- [ ] OCL is prioritized for simple projections and collections.
- [ ] Java helpers are placed under the package-matching folder under `src/`.
- [ ] No external JAR compilation is attempted; sources are left as raw `.java` files.
