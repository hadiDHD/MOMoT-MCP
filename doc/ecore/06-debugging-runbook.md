# Ecore Wiki — Chapter 06: Top 10 Ecore Errors Debugging Runbook

This chapter is the authoritative triage and repair runbook for Ecore metamodel compilation and validation. Use the solutions below to automatically or manually resolve errors encountered during Phase 3 and Phase 4 validation steps.

---

### 1. Missing Required Attribute 'name'
**Error:** `The required feature 'name' of '...' must be set`  
**Root cause:** An XML element representing an EClassifier (EClass, EEnum, etc.) or EStructuralFeature (EAttribute, EReference) is missing its identifying `name` property.  
**Fix:** Add `name="YourIdentifier"` to the offending XML element.

---

### 2. Duplicate Namespace URI (nsURI)
**Error:** `Duplicate feature 'nsURI'`  
**Root cause:** The `nsURI` attribute on the `<ecore:EPackage>` root is declared more than once, or matches another metamodel registered in the global registry.  
**Fix:** Ensure `nsURI` is declared exactly once and represents a globally unique string.

---

### 3. SuperType Not Applicable
**Error:** `The feature 'eSuperTypes' is not applicable`  
**Root cause:** The `eSuperTypes` attribute is applied to an element that is not an EClass (e.g., an EAttribute).  
**Fix:** Move the `eSuperTypes` attribute strictly onto elements declared with `xsi:type="ecore:EClass"`.

---

### 4. Unresolved Proxy / Broken Reference
**Error:** `Unresolved proxy <href>`  
**Root cause:** The parser failed to resolve an internal link or href reference (e.g., in `eType` or `eSuperTypes`).  
**Fix:** Check for typos in target names and ensure references are prefixed with `#//` (e.g., `eType="#//Task"`).

---

### 5. Containment Cycle Detected
**Error:** `Containment cycle detected`  
**Root cause:** A chain of containment references forms a closed loop, meaning an object could transitively contain its own parent.  
**Fix:** Break the loop by changing at least one containment reference in the chain to a standard cross-reference (`containment="false"`).

---

### 6. Missing EOpposite Symmetry
**Error:** `The opposite of '...' does not reference '...'`  
**Root cause:** An `eOpposite` association is unidirectional or asymmetrical.  
**Fix:** Ensure both ends of the bidirectional relationship are declared and point to each other exactly:
- Reference A in Class X: `eOpposite="#//Y/B"`
- Reference B in Class Y: `eOpposite="#//X/A"`

---

### 7. Incorrect EDataType Name
**Error:** `EDataType not found: EInteger`  
**Root cause:** Attempting to map an EAttribute to a non-existent primitive name (e.g., `EInteger`, `EStringList`).  
**Fix:** Replace with standard EMF types (e.g., use `EInt` instead of `EInteger`).

---

### 8. Missing XMI Serialization Version
**Error:** `xmi:version attribute missing`  
**Root cause:** The root EPackage element does not identify itself as an XMI document.  
**Fix:** Add `xmi:version="2.0"` to the `<ecore:EPackage>` root.

---

### 9. Typeless Structural Feature
**Error:** `eType not set on EStructuralFeature`  
**Root cause:** An EAttribute or EReference was declared but lacks the mandatory `eType` property.  
**Fix:** Add `eType` pointing to either an EDataType or another EClass.

---

### 10. Multi-Root Metamodel (Malformed XML)
**Error:** `More than one root element`  
**Root cause:** There are multiple root elements, or tags are unclosed, causing the parser to treat sections as disjoint trees.  
**Fix:** Wrap the entire document in a single `<ecore:EPackage>` element and verify all tags close correctly.
