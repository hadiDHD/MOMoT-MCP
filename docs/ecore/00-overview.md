# Ecore Wiki — Chapter 00: What is Ecore?

This chapter introduces the foundational concepts of Eclipse Modeling Framework (EMF) Ecore metamodeling. Ecore is the meta-metamodel used to define structural domain models (metamodels) for the MOMoT framework. All problem domains in MOMoT must be declared as a valid Ecore metamodel serialization, typically housed in a `.ecore` file.

## Essential Concepts

Ecore uses a simplified subset of UML class diagrams to model domains. The meta-metamodel defines five core structural concepts:

1. **`EPackage`**: The root container representing a namespace or module. It contains all classifiers and nested packages. An EPackage maps directly to a Java package when code is generated.
2. **`EClass`**: Represents a domain entity or concept. EClasses can define attributes, references, and operations. They can be abstract or concrete and support single or multiple inheritance.
3. **`EAttribute`**: Represents a primitive property or value holder within an EClass (e.g., name, duration, capacity).
4. **`EReference`**: Represents an association, link, or lifetime-containment relation between two EClasses.
5. **`EDataType`**: Represents primitive or custom data types (e.g., `EString`, `EInt`, `EBoolean`) that form the types of EAttributes.

## The nsURI and nsPrefix

Every `EPackage` must specify two mandatory identifiers:
- **`nsURI`** (Namespace URI): A globally unique string representing the package namespace (e.g., `http://at.ac.tuwien.big.momot/examples/stack/1.0`). In XMI instances, this URI is crucial; it tells the XML parser which metamodel matches the instance and is used in the `xsi:schemaLocation` attribute.
- **`nsPrefix`** (Namespace Prefix): A short namespace alias used as an XML namespace prefix in serialized XMI instances.

## Root XMI Structure

An Ecore metamodel is serialized as an XML document with an `<ecore:EPackage>` root element. The following mandatory namespaces must be declared.

### Canonical Template

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="stack"
    nsURI="http://at.ac.tuwien.big.momot/examples/stack/1.0"
    nsPrefix="stack">
  <!-- Classifier declarations go here -->
</ecore:EPackage>
```

### Common Errors

**Error:** `xmi:version="2.0" attribute missing`  
**Root cause:** The XML parser fails to recognize the document as a standard XMI serialization.  
**Fix:** Ensure the root element contains `xmi:version="2.0"` exactly as shown in the template.

**Error:** `Duplicate nsURI across packages`  
**Root cause:** Multiple metamodels registered in the EMF Registry share the exact same `nsURI`, causing load-time resolution collisions.  
**Fix:** Append a version tag or unique domain name to the `nsURI` (e.g., `http://yourdomain.com/domain/1.0`).

## Verification Checklist

- [ ] Root element is `<ecore:EPackage>`.
- [ ] Attributes `xmi:version`, `xmlns:xmi`, `xmlns:xsi`, and `xmlns:ecore` are declared exactly.
- [ ] `nsURI` is a globally unique and valid URI.
- [ ] `nsPrefix` is lowercase and contains only alphanumeric characters.
- [ ] `name` is a valid Java identifier.
