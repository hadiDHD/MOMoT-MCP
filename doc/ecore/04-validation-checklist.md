# Ecore Wiki — Chapter 04: The 15-Point Validation Checklist

This chapter outlines the mandatory 15-point pre-flight checklist that must be executed by any agent before submitting an `.ecore` file to the validation tools. Reviewing these structural and semantic rules manually or programmatically dramatically reduces the depth of repair loops and ensures high-quality metamodel generation.

## The 15-Point Checklist

### 1. Root Element Conformity
Ensure the XML root element is exactly `<ecore:EPackage>`. No other root wrapper (such as `<model>` or `<Ecore>`) is permitted.

### 2. Mandatory Namespaces
The root element must declare all of the following namespaces verbatim:
- `xmlns:xmi="http://www.omg.org/XMI"`
- `xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`
- `xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"`

### 3. Namespace URI and Prefix
Verify that `nsURI` and `nsPrefix` attributes are present. `nsURI` must be globally unique and formatted as a URL (e.g., `http://example.com/domain/1.0`). `nsPrefix` must be a short lowercase name.

### 4. Metamodel Package Name
The `name` attribute of the EPackage must match Java package naming rules (lowercase, alphanumeric, starting with a letter).

### 5. Unique Classifier Names
Within the same EPackage, no two EClasses or EEnums can share the same name (case-sensitive check).

### 6. XMI Serialization Version
The root EPackage element must contain `xmi:version="2.0"`.

### 7. Unique Structural Features
No two EAttributes or EReferences inside the same EClass can share the same name.

### 8. Concrete Class Containment Reachability
All concrete EClasses must be reachable from a single root EClass via containment references (or be the root itself). This ensures that instances can be saved in a single valid XMI containment tree.

### 9. Structural Feature Type Resolution
Every EAttribute and EReference must declare an `eType` attribute.

### 10. Primitive Type Href Mapping
Every EAttribute `eType` pointing to a primitive must reference standard EMF types (e.g., `ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EString` or `ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EInt`).

### 11. Supertype Reference Resolution
The `eSuperTypes` attribute of any class must reference a valid EClass path within the package (prefixed with `#//`).

### 12. Containment Attribute Validity
A reference intended to contain other objects must have `containment="true"`. Standard non-containment references must have `containment="false"` or omit the attribute entirely.

### 13. Opposite Association Symmetry
If `eOpposite` is set on reference A in Class X pointing to reference B in Class Y (`#//Y/B`), reference B in Class Y must exist and have its `eOpposite` set to `#//X/A`.

### 14. Containment Cycle Prevention
No containment references may create a loop of ownership (e.g., Class A contains Class B contains Class A) which prevents constructing a valid hierarchical XML tree.

### 15. Default Value Validation
If `defaultValueLiteral` is specified, its value must be parsable as the declared primitive data type (e.g., `defaultValueLiteral="false"` for an `EBoolean` attribute).

## Running Local Validation

Once all 15 points are verified, run the CLI tool:
```bash
node tools/ecore-validator/validate.mjs --validate-structure path/to/model.ecore
node tools/ecore-validator/validate.mjs --validate-semantic path/to/model.ecore
```
If errors are encountered, consult [06-debugging-runbook.md](06-debugging-runbook.md) for automated repair instructions.
