# Java-Helpers Wiki — Chapter 03: When OCL Fails and Java Takes Over

This chapter documents the 5 known design limitations of OCL (Object Constraint Language) within declarative MOMoT scripts and provides their equivalent Java programmatic workarounds.

---

## 1. No Recursion / Depth Exploration
OCL cannot easily compute transitive closures or search recursive parent-child trees without manually hardcoding depth levels.

- **Failing OCL Expression**:  
  `"nodes->collect(n | n.children->collect(c | c.children))->size()"` *(Only works up to 2 levels)*
- **Java Solution**:
  ```java
  public int computeMaxDepth(Node node) {
      if (node.getChildren().isEmpty()) return 0;
      int max = 0;
      for (Node child : node.getChildren()) {
          max = Math.max(max, computeMaxDepth(child));
      }
      return 1 + max;
  }
  ```

---

## 2. No External Data Access
OCL is restricted strictly to navigating attributes and associations present in the current Ecore graph. It cannot look up external cost matrices or SQLite databases.

- **Failing OCL Expression**:  
  `"tasks->collect(t | t.assignedTo.getDistanceMatrix(t.origin, t.dest))->sum()"` *(Fails; cannot read external arrays)*
- **Java Solution**:  
  Load distance matrices once into a static `HashMap<String, Double>` using Java IO, then query within the evaluate method.

---

## 3. Lack of Caching / Memoization
OCL evaluations are stateless and evaluated fresh on every single run. High-frequency search iterations can quickly cause CPU bottlenecks on large graphs.

- **Failing OCL Expression**:  
  *(There is no caching operator in OCL)*
- **Java Solution**:
  Maintain a cache keyed on EGraph state using standard Map utilities:
  ```java
  private final Map<EGraph, double[]> memoMap = new WeakHashMap<>();
  ```

---

## 4. No Stateful Step-Based Objectives
OCL cannot compute values that depend on intermediate transformation states or histories (e.g., tracking total distance traveled during a step sequence).

- **Failing OCL Expression**:  
  *(OCL can only view the static final model snapshot)*
- **Java Solution**:  
  Inspect the `TransformationSolution` trace history to aggregate objective changes across individual transformation steps.

---

## 5. Integer Division and Numeric Precision
OCL division can silently truncate integer divisions depending on structural coercions, introducing arithmetic errors in standard average calculations.

- **Failing OCL Expression**:  
  `"tasks->collect(t | t.duration)->sum() / machines->size()"` *(Truncates if all inputs are integers)*
- **Java Solution**:  
  Compute averages using native, high-precision `double` casting:
  ```java
  double avg = (double) totalDuration / (double) machineCount;
  ```

## Verification Checklist

- [ ] Objectives requiring recursion or external IO are written in Java, not OCL.
- [ ] Precision casting is enforced in Java to prevent silent integer divisions.
- [ ] Caching is introduced strictly for expensive graph evaluations.
