# XMI Wiki — Chapter 03: Algorithmic Generation from Ecore

This chapter provides a structured algorithm for generating a valid XMI instance from an Ecore metamodel. The XMI Agent should follow this algorithm to produce syntactically and semantically correct models on the first try.

---

## The Generation Algorithm

```
INPUT: ecoreMetamodel, problemDescription, instanceSize (default 5)
OUTPUT: valid XMI instance (.xmi)

1. Find the Containment Root EClass:
   - Analyze the Ecore file to locate the single EClass that is not target of any containment references.
   - For example, "Schedule" or "StackModel".

2. Emit Root Header:
   - Begin writing the XML. Create the root tag using the EPackage's nsPrefix and root class name:
     <prefix:RootClass xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" ...>
   - Add xmlns:xsi and xmlns:prefix declarations.
   - Set xsi:schemaLocation pointing to the EPackage nsURI and the relative path of the .ecore file.

3. Instantiate Containment References:
   - For each containment EReference in the root class:
     a. Determine the target EClass.
     b. Generate N instances of the EClass (where N = instanceSize, default 5).
     c. For each instance, generate a unique ID of the form '_className_index' (e.g., '_task1', '_task2').
     d. Populate EAttributes on each instance with valid primitive values representing the problem baseline.
     e. Nest these elements inside the root XML element.

4. Establish Non-Containment Cross-References:
   - For each cross-reference (e.g., Task.assignedTo or Node.next):
     a. Match the reference with its valid target instances in the model.
     b. Select a target instance to establish the link.
     c. Write the target element's xmi:id as the value of the reference attribute (e.g., assignedTo="_machine1").

5. Enforce the "Bad Start" Requirement (Initial State Imbalance):
   - Locate the primary optimization metric (e.g., total delay, task assignment load, stack sizes).
   - Arrange initial associations to represent the worst possible state.
   - Example: Assign ALL Tasks to the first Machine, leaving all other Machines empty. This forces the optimization algorithm to perform load distribution.

6. Close root XML element and save.
```

## Good-Start vs. Bad-Start Guidance

- **Why a "Bad Start"?** MOMoT is an evolutionary algorithm. If you supply a "good" or pre-optimized start state, the algorithm will quickly get stuck in local optima and fail to generate a diverse Pareto front.
- **Establishing baselines**: Always establish a worst-case scenario. This gives NSGA-II/III maximum room to mutate, apply transformation rules, and find trade-offs. Putting all tasks on one machine makes the initial makespan extremely high, allowing the algorithm to show progress as it balances the schedule.

## Verification Checklist

- [ ] Containment root EClass is identified and used as the root XML tag.
- [ ] At least 5 elements are generated for the primary collections.
- [ ] Elements contain unique, non-colliding `xmi:id` attributes.
- [ ] All cross-references refer to elements that exist in the document.
- [ ] The model represents a maximally imbalanced starting baseline.
