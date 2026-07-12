# Ecore Wiki — Chapter 03: EReference Patterns

This chapter describes how to construct associations between EClasses using EReferences. EReferences are the glue that holds your domain object graph together. Modeling these correctly ensures that the Henshin transformation rules can navigate and mutate relations without violating EMF constraints or creating dangling pointers.

## Containment vs Non-Containment

A reference can be either a containment reference or a non-containment reference.

### 1. Containment Reference (`containment="true"`)
- Represents **lifetime ownership** or composition.
- The parent node is responsible for the child node. If the parent is deleted, all contained children are deleted too.
- An object can have **at most one** containment container. This is a strict EMF invariant.
- All elements in a model instance must be reachable from the root container through a path of containment references.

### 2. Non-Containment Reference (`containment="false"`, default)
- Represents a **cross-reference** or association.
- Both entities exist independently. Deleting the reference does not delete the target object.
- Used to model assignments, links, or dependencies (e.g., a `Task` refers to a `Machine` on which it runs).

## Cardinality and Bounds

- **`upperBound="1"`**: Single-valued reference (e.g., a Task is assigned to exactly one Machine).
- **`upperBound="-1"`**: Multi-valued reference (represents a collection, like a Machine containing many Tasks).

## Bidirectional References and EOpposite

To allow navigation in both directions, associations can be declared as bidirectional. This is done by setting the `eOpposite` attribute on both references, pointing to each other. This creates a synchronization constraint: updating one end automatically updates the other.

## Canonical Templates

### 1. Containment Reference (Stack contains many Elements)
```xml
<eStructuralFeatures xsi:type="ecore:EReference" name="elements"
    upperBound="-1" eType="#//Element" containment="true"/>
```

### 2. Non-Containment Assignment (Task assigned to Machine)
```xml
<eStructuralFeatures xsi:type="ecore:EReference" name="assignedTo"
    upperBound="1" eType="#//Machine" containment="false"/>
```

### 3. Bidirectional Opposite (Task ↔ Machine)
```xml
<!-- In Class Machine -->
<eStructuralFeatures xsi:type="ecore:EReference" name="tasks"
    upperBound="-1" eType="#//Task" containment="false" eOpposite="#//Task/assignedTo"/>

<!-- In Class Task -->
<eStructuralFeatures xsi:type="ecore:EReference" name="assignedTo"
    upperBound="1" eType="#//Machine" containment="false" eOpposite="#//Machine/tasks"/>
```

## Common Errors

**Error:** `Mismatch in bidirectional opposites`  
**Root cause:** Declaring `eOpposite` on one end of the reference but forgetting to define it or declaring it incorrectly on the other end. This violates semantic validation.  
**Fix:** Ensure both features refer to each other's path precisely: `eOpposite="#//<OtherClass>/<OtherFeature>"`.

**Error:** `Double containment violation`  
**Root cause:** An object instance is added to two containment references simultaneously during Henshin execution, violating the single-parent invariant.  
**Fix:** Before adding an element to a new container, Henshin must delete its existing containment edge or use a non-containment reference instead.

## Verification Checklist

- [ ] Every reference is declared as `xsi:type="ecore:EReference"`.
- [ ] Containment references have `containment="true"` explicitly set.
- [ ] Non-containment references are set to `containment="false"` (or omit the attribute).
- [ ] `eType` references use the `#//ClassName` format for local package classes.
- [ ] `eOpposite` fields are paired and reference correct class/feature paths on both sides.
- [ ] Every element in the metamodel is reachable from the single root container.
