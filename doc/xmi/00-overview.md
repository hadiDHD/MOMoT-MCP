# XMI Wiki — Chapter 00: XMI Format

This chapter introduces the XML Metadata Interchange (XMI) format, which is the standard XML serialization format used by EMF to store model instances. To run MOMoT optimization algorithms, you must supply an initial problem state serialized as a valid XMI document that strictly conforms to your Ecore metamodel.

## Structural Anatomy of an XMI Document

An XMI model instance consists of a hierarchical XML document whose root element corresponds to the single containment root of your metamodel.

### 1. The Schema Location Binding (`xsi:schemaLocation`)
This attribute is **absolutely critical** for EMF's resource loaders. It is a space-separated pair consisting of:
- The exact `nsURI` of the Ecore metamodel (e.g., `http://mypackage/1.0`).
- The relative or absolute filesystem path to the `.ecore` metamodel file (e.g., `../mypackage.ecore`).

Without this binding, EMF cannot map the XML tags to their corresponding Ecore classes, and parsing will fail immediately.

### 2. Identifying Elements (`xmi:id`)
Every object instantiated within the XML tree must declare a unique `xmi:id` attribute (e.g., `_task1`, `_machine2`). This ID is used for referential integrity and allows other elements in the graph to establish non-containment cross-references to it.

### 3. Polymorphism (`xmi:type`)
When a reference slot can hold multiple concrete subclasses of an abstract base type, you must declare the specific concrete class using the `xsi:type` attribute on the element (e.g., `xsi:type="mypackage:Engineer"`).

## Containment vs Cross-Reference Serialization

EMF serializes associations differently depending on whether they are containment or non-containment:
- **Containment references**: Serialized as **nested XML elements** inside the parent element (representing lifecycle ownership).
- **Non-containment cross-references**: Serialized as **attributes** on the referencing element using the `href` prefix format (e.g., `assignedTo="_machine1"`).

## Canonical Minimal Instance

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mypackage:Container xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:mypackage="http://mypackage/1.0"
    xsi:schemaLocation="http://mypackage/1.0 ../mypackage.ecore">
  <items xmi:id="_item1" name="Alpha"/>
  <items xmi:id="_item2" name="Beta"/>
</mypackage:Container>
```

## Common Errors

**Error:** `xsi:schemaLocation path wrong or cannot be resolved`  
**Root cause:** The second parameter in the space-separated pair contains a typo, or does not point to the correct Ecore path relative to the location of the `.xmi` file.  
**Fix:** Adjust the relative path so that it correctly points to the `.ecore` file from the directory where the `.xmi` file resides.

## Verification Checklist

- [ ] XML root starts with `<yourPrefix:RootClassName>`.
- [ ] Root defines `xmi:version="2.0"`.
- [ ] `xsi:schemaLocation` is declared and contains a valid space-separated `nsURI` and Ecore path pair.
- [ ] All nested elements declare a unique `xmi:id`.
- [ ] Polymorphic elements declare their concrete type with `xsi:type`.
