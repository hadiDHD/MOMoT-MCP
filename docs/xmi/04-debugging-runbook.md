# XMI Wiki — Chapter 04: Top 8 XMI Errors Debugging Runbook

This chapter is the authoritative triage and repair runbook for XMI model instance deserialization and validation. Use the solutions below to automatically or manually resolve errors encountered during Phase 3 and Phase 4 validation steps.

---

### 1. Cannot Load Resource (Location/Path Mismatch)
**Error:** `org.eclipse.emf.ecore.resource.Resource$IOWrappedException: Cannot load resource`  
**Root cause:** The path specified in the `xsi:schemaLocation` attribute does not point to a valid `.ecore` file relative to the `.xmi` file.  
**Fix:** Adjust the relative path in the second parameter of `xsi:schemaLocation` so that it resolves to the actual `.ecore` file on disk.

---

### 2. Unresolved Proxy (Dangling Reference)
**Error:** `Unresolved proxy: <file>#<id>`  
**Root cause:** A cross-reference refers to an `xmi:id` that does not exist in the document or cannot be resolved because of an incorrect fragment format.  
**Fix:** Ensure that every cross-reference is prefixed with `#` and matches an existing `<element xmi:id="...">` precisely.

---

### 3. Invalid Feature on EClass
**Error:** `Feature 'xxx' is not a valid feature of 'YYY'`  
**Root cause:** An XML element or attribute named `xxx` is declared, but Class `YYY` in the Ecore metamodel does not have an attribute or reference with that name.  
**Fix:** Correct the spelling of the attribute/reference, or verify that the EClass corresponds to the intended metamodel type.

---

### 4. Type Mismatch / Assignment Error
**Error:** `Cannot assign 'XType' to feature 'f' of type 'YType'`  
**Root cause:** Trying to assign a reference or value of type `XType` to a structural feature `f` whose declared type in the Ecore is `YType`, and `XType` is not a subclass of `YType`.  
**Fix:** Ensure that the target element inherits from or is exactly of the declared type `YType`.

---

### 5. Dangling Containment (Uncontained Element)
**Error:** `Object ... is not contained`  
**Root cause:** An instantiated element exists in the XML structure but is not reachable from the root container through a containment reference.  
**Fix:** Ensure that the element is nested inside a parent element that defines `containment="true"` on the reference feature.

---

### 6. Multiple Root Elements
**Error:** `Multiple roots not allowed`  
**Root cause:** The XML document has more than one top-level element, violating XML and XMI standard structure.  
**Fix:** Wrap all elements in a single root element (the containment root class).

---

### 7. Duplicate XMI Identifiers
**Error:** `Duplicate xmi:id`  
**Root cause:** Two or more elements in the document share the same `xmi:id` value.  
**Fix:** Regenerate IDs ensuring they are unique (e.g., prefix with class name and a counter like `_task1`, `_machine1`).

---

### 8. Namespace/Prefix Mismatch
**Error:** `Root element namespace doesn't match`  
**Root cause:** The namespace prefix declared on the root element does not match the `nsPrefix` defined in the Ecore metamodel.  
**Fix:** Change the root XML tag prefix to match the `nsPrefix` exactly (e.g., `<scheduling:Schedule>` instead of `<sched:Schedule>`).

---

### 9. Duplicate EPackage Registration Collision (xsi:schemaLocation)
**Error:** Unresolved proxies or NullPointerExceptions (`this.source is null`) during rule execution.  
**Root cause:** Using `xsi:schemaLocation` in model files when the same dynamic EPackage is registered globally or explicitly in the `ResourceSet`. Duplicate loading under different URIs results in disjoint EPackage instances.  
**Fix:** Remove `xsi:schemaLocation` from the XMI file if the package is loaded globally or explicitly.

