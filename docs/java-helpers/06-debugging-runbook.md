# Java-Helpers Wiki — Chapter 06: Top 5 Java Helper Errors Debugging Runbook

This chapter is the authoritative triage and repair runbook for Java helper integration and compilation. Use the solutions below to automatically or manually resolve errors encountered during Phase 3 and Phase 4 validation steps.

---

### 1. ClassNotFoundException: CustomFitness
**Error:** `java.lang.ClassNotFoundException: mypackage.CustomFitness`  
**Root cause:** The MOMoT runner cannot locate the helper class on the execution classpath.
- The package name in the `.java` file does not match the actual folder structure under `src/`.
- The import statement in the `.momot` script FQN is misspelled or missing.

**Fix:** Ensure the Java file resides at `src/mypackage/CustomFitness.java` and has `package mypackage;` as its first line. Check the import statement in `.momot` is `import mypackage.CustomFitness` exactly.

---

### 2. ArrayIndexOutOfBoundsException in evaluate
**Error:** `java.lang.ArrayIndexOutOfBoundsException: Index 1 out of bounds for length 1`  
**Root cause:** The overridden `evaluate` method returned an array of a different length than expected by the MOMoT search definition. MOMoT expects the array size to match the number of declared fitness objectives mapped to that class.  
**Fix:** Verify how many objectives are assigned to this custom Java fitness class in the `.momot` script, and adjust the returned array size:
`return new double[]{ value1, value2 }; // If 2 objectives are mapped`

---

### 3. ClassCastException: EObject cannot be cast to CustomClass
**Error:** `java.lang.ClassCastException: org.eclipse.emf.ecore.impl.DynamicEObjectImpl cannot be cast to mypackage.CustomClass`  
**Root cause:** Pointing to generated domain classes on the classpath that are not available at runtime, or trying to perform a cast on a generic `EObject` instance.  
**Fix:** Navigate the model reflexively using EMF's `eGet()` API instead of class casting:
`String name = (String) element.eGet(element.eClass().getEStructuralFeature("name"));`

---

### 4. NullPointerException in getRoots().get(0)
**Error:** `java.lang.NullPointerException: Cannot invoke "org.eclipse.emf.ecore.EObject.eGet(...)" because "root" is null`  
**Root cause:** The solution model graph is empty (e.g., during initialization or rule failure), resulting in `graph.getRoots().isEmpty()` returning true, and calling `get(0)` throwing an exception.  
**Fix:** Guard the evaluation method at the very beginning of execution:
```java
if (graph.getRoots().isEmpty()) {
    return new double[]{ 0.0 };
}
```

---

### 5. Cannot Find Symbol: AbstractEGraphFitness
**Error:** `error: cannot find symbol class AbstractEGraphFitness`  
**Root cause:** Local `javac` command was run without proper classpaths, or classpath references inside the headless runner configuration are corrupt.  
**Fix:** Supply the framework JAR dependencies to `javac` using the `-cp` parameter:
`javac -cp "henshin-agent/bin/lib/*;tools/momot-validator/lib/*" src/mypackage/MyFitness.java`
