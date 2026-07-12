# XMI Wiki — Chapter 02: The 10-Point Validation Checklist

This chapter outlines the mandatory 10-point pre-flight checklist that must be executed by any agent before submitting an `.xmi` file to the validation tools. Reviewing these structural and semantic rules manually or programmatically dramatically reduces the depth of repair loops and ensures high-quality instance generation.

## The 10-Point Checklist

### 1. Schema Location Match
Ensure that the `xsi:schemaLocation` attribute contains the exact Ecore `nsURI` as its first parameter (e.g., `http://at.ac.tuwien.big.momot/examples/stack/1.0`).

### 2. Relative Path Resolution
Verify that the second parameter of `xsi:schemaLocation` resolves to the actual `.ecore` file location relative to the location of the `.xmi` file.

### 3. Case-Sensitive Root Element
Verify that the XML root element name matches the name of the root EClass in your Ecore metamodel (case-sensitive, e.g., `<stack:StackModel>` not `<stack:stackmodel>`).

### 4. Matching Namespace Prefix
The root namespace declaration (e.g., `xmlns:stack="..."`) must exactly match the `nsPrefix` defined in the Ecore metamodel.

### 5. Document-Wide ID Uniqueness
Verify that every nested element has an `xmi:id` attribute, and that every ID is globally unique across the entire XML document. No two elements may share an ID (e.g., do not duplicate `_node1`).

### 6. Correct Cross-Reference Format
All non-containment cross-references (such as `assignedTo` or `eOpposite` references) must reference target elements using their `xmi:id` values (e.g., `assignedTo="_machine1"`).

### 7. Referential Integrity
Ensure that every `xmi:id` referenced in any attribute actually exists in the document. No dangling IDs are allowed.

### 8. Structural Containment Validity
Ensure that containment references are serialized strictly using XML element nesting, rather than `href` attributes.

### 9. Upper Bound Conformity
For single-valued references (`upperBound="1"`), ensure that there is at most one XML child element or cross-reference ID specified.

### 10. Polymorphic Slot Type Specifications
For references that can accept polymorphic subclasses of an abstract base type, ensure that every nested element specifies its concrete subclass using the `xsi:type` attribute (e.g., `xsi:type="scheduling:Developer"`).

## Running Local Validation

Once all 10 points are verified, run the CLI tool:
```bash
node tools/xmi-validator/validate.mjs --validate-structure path/to/instance.xmi
node tools/xmi-validator/validate.mjs --validate-semantic --ecore path/to/model.ecore path/to/instance.xmi
```
If errors are encountered, consult [04-debugging-runbook.md](04-debugging-runbook.md) for automated repair instructions.
