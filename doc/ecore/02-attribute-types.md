# Ecore Wiki — Chapter 02: EAttribute Types

This chapter describes how to define primitives and values in your classes using EAttributes. EAttributes represent properties (such as integers, strings, and booleans) that hold simple values. Selecting the correct Ecore primitive type guarantees that the Java code generator and OCL interpreter resolve operations like additions, subtractions, and maximums correctly during search.

## Primitive Types Mapping

In Ecore, attributes are defined via the `<eStructuralFeatures xsi:type="ecore:EAttribute">` element. The type of the attribute is set using the `eType` attribute, which references a built-in EMF primitive type.

| Common Domain Type | Ecore DataType Name | Correct `eType` href |
|---|---|---|
| String | `EString` | `http://www.eclipse.org/emf/2002/Ecore#//EString` |
| Integer | `EInt` | `http://www.eclipse.org/emf/2002/Ecore#//EInt` |
| Double / Real | `EDouble` | `http://www.eclipse.org/emf/2002/Ecore#//EDouble` |
| Boolean | `EBoolean` | `http://www.eclipse.org/emf/2002/Ecore#//EBoolean` |
| Float | `EFloat` | `http://www.eclipse.org/emf/2002/Ecore#//EFloat` |
| Long | `ELong` | `http://www.eclipse.org/emf/2002/Ecore#//ELong` |
| Short | `EShort` | `http://www.eclipse.org/emf/2002/Ecore#//EShort` |

## Default Values and Bounds

To define boundary conditions, EAttributes support several parameters:
- **`defaultValueLiteral`**: A string representing the initial value. For `EInt`, set to `"0"`. For `EBoolean`, set to `"false"`. For `EString`, this can be empty or set to a default word.
- **`lowerBound`**: The minimum number of values. Usually `"0"` or `"1"`.
- **`upperBound`**: The maximum number of values. For single primitive properties, this is always `"1"`.

## Canonical Template

```xml
<eStructuralFeatures xsi:type="ecore:EAttribute" name="duration"
    eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EInt"
    defaultValueLiteral="1" lowerBound="1" upperBound="1"/>
```

## Modeling Enumerations (EEnum)

When you need an attribute that can only accept values from a specific set (like task priorities or machine statuses), define an `EEnum` (enumeration) at package level, then use it as the `eType` of your attribute.

```xml
<eClassifiers xsi:type="ecore:EEnum" name="Priority">
  <eLiterals name="LOW" value="0"/>
  <eLiterals name="MEDIUM" value="1"/>
  <eLiterals name="HIGH" value="2"/>
</eClassifiers>

<!-- In EClass Task -->
<eStructuralFeatures xsi:type="ecore:EAttribute" name="priority"
    eType="#//Priority" defaultValueLiteral="LOW"/>
```

## Common Errors

**Error:** `EDataType not found: EInteger`  
**Root cause:** Attempting to use non-standard type names (such as `EInteger` or `EInt32`). Ecore uses exact, case-sensitive names for primitive types.  
**Fix:** Replace with `EInt` or `EDouble` referencing the exact EMF URI.

**Error:** `Using EReference for a primitive type`  
**Root cause:** Declaring a structural feature as `xsi:type="ecore:EReference"` but pointing `eType` to a primitive `EDataType`. References are only for complex class associations.  
**Fix:** Change the `xsi:type` attribute to `"ecore:EAttribute"`.

## Verification Checklist

- [ ] All primitives are declared as `xsi:type="ecore:EAttribute"`.
- [ ] `eType` hrefs use the exact `http://www.eclipse.org/emf/2002/Ecore#//...` format.
- [ ] `defaultValueLiteral` values are compatible with the declared type.
- [ ] Upper bound is set to `"1"` for single primitive attributes.
- [ ] Custom enums are declared as `xsi:type="ecore:EEnum"` and referenced relative via `#//EnumName`.
