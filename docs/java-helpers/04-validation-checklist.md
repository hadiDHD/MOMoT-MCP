# Java-Helpers Wiki — Chapter 04: Java Helper Validation Checklist

This chapter outlines the structural and compilation verification steps for custom Java helpers. Reviewing these rules manually or programmatically dramatically reduces the depth of repair loops and ensures high-quality class compilation.

---

## The Compilation Pipeline

During the pre-execution phase of a MOMoT job, the headless REST runner dynamically compiles all Java sources found in the uploaded archive. Because a compilation warning or error halts the runner immediately, you must validate compilation locally first.

### Local Compilation Validation

To test your helper's syntax and classpath integration locally, use `javac` from your JDK. You can use the compiled validator JARs inside the `henshin-agent/bin/lib/` folder as a proxy classpath:

```bash
javac -cp "henshin-agent/bin/lib/*;tools/momot-validator/lib/*" src/mypackage/MyFitness.java
```

If compilation succeeds, `javac` exits with `0` and generates `MyFitness.class`.

---

## The 10-Point Java Validation Checklist

### 1. Package Declaration Matching
Ensure the package statement matches the directory structure exactly (e.g., `package at.ac.tuwien.big.momot` if in `src/at/ac/tuwien/big/momot/`).

### 2. Mandatory Imports
The class must import standard MOMoT and Henshin types:
- `at.ac.tuwien.big.momot.search.fitness.AbstractEGraphFitness`
- `at.ac.tuwien.big.momot.problem.solution.TransformationSolution`
- `org.eclipse.emf.henshin.interpreter.EGraph`

### 3. Correct Base Class
Verify the class inherits strictly from `AbstractEGraphFitness`.

### 4. Overridden Method Signature
The evaluation method signature must match exactly:
`public double[] evaluate(TransformationSolution solution)`

### 5. Return Array Length
Ensure the size of the returned `double[]` array corresponds exactly to the number of objectives mapped to this helper class.

### 6. Empty Graph Guarding
Always guard against empty graphs. If `graph.getRoots().isEmpty()` is true, return a zero-valued array safely to avoid `NullPointerException` or `IndexOutOfBoundsException`.

### 7. Explicit Feature Casting
Cast EAttribute eGet values to their proper Java equivalents (e.g., `(Integer)` for `EInt`, `(Double)` for `EDouble`, `(Boolean)` for `EBoolean`).

### 8. Reference List Type Safety
When casting a multi-valued EReference, cast it to `EList<EObject>` or `List<EObject>` before iterating.

### 9. Thread Safety / Stateless Evaluation
Ensure your helper maintains no state across evaluations (unless using WeakHashMaps for memoization). Concurrent search execution demands thread-safe evaluation.

### 10. No Unused Dependencies
Remove any unnecessary imports or unfinished debug print blocks to keep the compilation footprint small.

## Verification Checklist

- [ ] Local `javac` compilation exits with code 0.
- [ ] No compilation warnings are generated.
- [ ] `evaluate` method is fully guarded against empty or null states.
- [ ] Return array matches the declared MOMoT objectives count.
