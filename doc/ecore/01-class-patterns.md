# Ecore Wiki — Chapter 01: EClass Patterns

This chapter explains how to model domain entities as EClasses within an Ecore metamodel. EClasses represent the structural types that populate your model. Proper structure is vital, because the MOMoT search engine depends on a clear, well-formed containment tree to load and save problem states.

## Class Definition Basics

An EClass represents a classification of objects. In Ecore, it is declared using the `<eClassifiers xsi:type="ecore:EClass">` tag.
- **`name`**: Must be PascalCase and represent a singular noun (e.g., `Task`, `Machine`, `Stack`).
- **`abstract`**: Set to `true` if this class cannot be instantiated directly, but only subclassed (e.g., `NamedElement`).
- **`interface`**: Set to `true` if this is a behavioral contract (rarely needed for search spaces).

## Inheritance Pattern

Inheritance allows a subclass to inherit attributes and references from a superclass. In Ecore, this is defined via the `eSuperTypes` attribute, which references the parent class using a fragment path.

```xml
<eClassifiers xsi:type="ecore:EClass" name="NamedElement" abstract="true">
  <eStructuralFeatures xsi:type="ecore:EAttribute" name="name" 
      eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EString"/>
</eClassifiers>

<eClassifiers xsi:type="ecore:EClass" name="Task" eSuperTypes="#//NamedElement">
  <!-- inherits name attribute -->
</eClassifiers>
```

## The Single Containment Root Rule

**MOMoT and EMF demand a single containment root.** This means there must be exactly one high-level container class (e.g., `StackModel`, `Schedule`, `System`) that holds all instances of other entities via containment references. Without a single root, the XMI deserializer cannot resolve relative references, and job loading will fail with XML errors.

## Canonical Templates

### 1. Concrete Class with Attributes
```xml
<eClassifiers xsi:type="ecore:EClass" name="Machine">
  <eStructuralFeatures xsi:type="ecore:EAttribute" name="id"
      eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EInt"/>
  <eStructuralFeatures xsi:type="ecore:EAttribute" name="capacity"
      eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EDouble"/>
</eClassifiers>
```

### 2. Abstract Base and Concrete Subclasses
```xml
<eClassifiers xsi:type="ecore:EClass" name="Worker" abstract="true"/>
<eClassifiers xsi:type="ecore:EClass" name="Engineer" eSuperTypes="#//Worker"/>
<eClassifiers xsi:type="ecore:EClass" name="Technician" eSuperTypes="#//Worker"/>
```

### 3. Root Container Class
```xml
<eClassifiers xsi:type="ecore:EClass" name="TaskModel">
  <eStructuralFeatures xsi:type="ecore:EReference" name="tasks" upperBound="-1"
      eType="#//Task" containment="true"/>
  <eStructuralFeatures xsi:type="ecore:EReference" name="machines" upperBound="-1"
      eType="#//Machine" containment="true"/>
</eClassifiers>
```

## Common Errors

**Error:** `Unresolved proxy <href> in eSuperTypes`  
**Root cause:** The value in `eSuperTypes` contains a typo or references a class that does not exist in the same XML scope.  
**Fix:** Verify the class name in `eSuperTypes="#//YourClassName"` exactly matches the target `<eClassifiers name="YourClassName">`.

**Error:** `Circular containment detected`  
**Root cause:** Class A contains Class B, which in turn contains Class A, creating an infinite nesting loop.  
**Fix:** Break the cycle by converting one of the containment references to a standard non-containment reference (`containment="false"`).

## Verification Checklist

- [ ] Every EClass `name` is unique and PascalCase.
- [ ] Exactly one class is designated as the root container.
- [ ] Abstract base classes have `abstract="true"` explicitly set.
- [ ] `eSuperTypes` references are prefixed with `#//` and resolve correctly.
- [ ] No circular containment reference paths exist.
