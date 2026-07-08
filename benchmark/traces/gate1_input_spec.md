# Gate 1 Input Specification: Class-Responsibility Assignment (CRA) Metamodel
## Input Text Received by Ecore Agent

This document represents the exact high-level structural and semantic requirements provided to the Ecore Agent to synthesize the `cra.ecore` metamodel.

---

### 1. Entity Definitions & Attributes

#### A. ClassModel
*   **Role:** The root container representing the entire system under analysis or optimization.
*   **Attributes:**
    *   `name`: EString (Required, ID)
*   **Containment References:**
    *   `classes`: `Class` [0..*] (Containment, Keys/ID: name)
    *   `features`: `Feature` [0..*] (Containment, Keys/ID: name)

#### B. Class
*   **Role:** A logical capsule representing a generated Class in the final software architecture.
*   **Attributes:**
    *   `name`: EString (Required, ID)
*   **Non-Containment References:**
    *   `encapsulates`: `Feature` [1..*] (Opposite: `isEncapsulatedBy`). Represents the features assigned to this class.

#### C. Feature (Abstract)
*   **Role:** The abstract superclass of any modular unit (attributes and methods).
*   **Attributes:**
    *   `name`: EString (Required, ID)
*   **Non-Containment References:**
    *   `isEncapsulatedBy`: `Class` [0..1] (Opposite: `encapsulates`). Points to the class encapsulating this feature.

#### D. Attribute (extends Feature)
*   **Role:** Represents a structural field/data member of the software system.
*   **Attributes:** Inherits `name` from `Feature`.
*   **References:** None.

#### E. Method (extends Feature)
*   **Role:** Represents an executable unit of behavior.
*   **Attributes:** Inherits `name` from `Feature`.
*   **Non-Containment References:**
    *   `dataAccess`: `Attribute` [0..*]. Models a method reading or writing an attribute.
    *   `methodCall`: `Method` [0..*]. Models a method calling another method.

---

### 2. Structural Constraints

1.  **Unique Identity:** All `Class`, `Attribute`, and `Method` instances within a `ClassModel` must have unique `name` properties.
2.  **Abstract Feature Class:** The class `Feature` must be marked as `abstract=true` in the Ecore metamodel.
3.  **Strict Bi-Directional Encapsulation:** The reference `Class.encapsulates` and `Feature.isEncapsulatedBy` must be opposite references (EMF `eOpposite` must be set). This ensures automatic inverse reference synchronization during optimization.
4.  **Cardinality Constraints:**
    *   **No Empty Classes:** In any valid final solution, a `Class` must contain at least **one** feature (`encapsulates` lower bound = 1).
    *   **Single Encapsulation:** In the final solution, every `Feature` must belong to exactly **one** `Class` (although the metamodel allows `0..1` to accommodate an initial unassigned state in input files, the optimizer's final state must enforce that all features are encapsulated).
5.  **No Illegal References:** An `Attribute` cannot have outbound `dataAccess` or `methodCall` references. A `Method` can only reference `Attribute`s via `dataAccess` and other `Method`s via `methodCall`.
