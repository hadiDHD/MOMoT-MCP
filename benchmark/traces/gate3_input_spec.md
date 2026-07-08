# Gate 3 Input Specification: Henshin Mutation Rules
## Input Text Received by Henshin Sub-Agent

This document represents the exact rule specification and negative application condition (NAC) guidelines provided to the Henshin Sub-Agent to synthesize the mutation operators inside `cra.henshin`.

---

### 1. Rule Specifications

#### Rule 1: `createClass`
*   **Goal:** Creates a new Class and assigns an unassigned Feature to it.
*   **LHS (Left Hand Side):**
    *   An unassigned Feature $f$ (where its encapsulation pointer `isEncapsulatedBy` is null/empty).
*   **RHS (Right Hand Side):**
    *   A new Class $c$, with an encapsulation link to $f$.
*   **NAC (Negative Application Condition):**
    *   Prevent match if Feature $f$ is already encapsulated by any Class.

#### Rule 2: `deleteClass`
*   **Goal:** Deletes a Class if it is empty (has no encapsulated features).
*   **LHS:**
    *   An existing Class $c$.
*   **RHS:**
    *   Class $c$ is deleted from the graph.
*   **NAC:**
    *   Class $c$ contains any Feature $f$ (meaning `c -> encapsulates -> f` exists).

#### Rule 3: `assignFeature`
*   **Goal:** Moves a Feature from one Class to another, or from unassigned to a Class.
*   **LHS:**
    *   A Feature $f$ and a target Class $c$.
*   **RHS:**
    *   An encapsulation link between target Class $c$ and Feature $f$.
*   **NAC:**
    *   Feature $f$ is already encapsulated by the target Class $c$ (preventing redundant mutations).

---

### 2. Critical Implementation Guidelines
*   Ensure all EMF inverse references (`eOpposite`) are updated automatically by the interpreter.
*   Formulate rules to be as **parameter-minimal** as possible. Rather than using string matching for target classes which might fail due to generated name mismatches, let `assignFeature` choose Class nodes directly in LHS, requiring only the single parameter `featureName` to specify the Feature being reassigned.
