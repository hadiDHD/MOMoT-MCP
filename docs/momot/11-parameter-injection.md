# MOMoT Wiki — Chapter 11: Rule Parameter Value Injection

This chapter describes how to inject values into Henshin transformation rule parameters from a `.momot` search script. Parameter injection allows the optimization algorithm to determine not only *which* rule to apply, but also *how* to apply it (e.g., specifying an integer offset, selecting a target item from a list, or setting random bounds).

---

## Parameter Value Injection Classes

MOMoT provides three primary classes to randomize and guide rule parameters during search. They are declared inside the `parameterValues` block under `transformations`.

### 1. `RandomListValue`
Selects an item at random from a fixed list of enumerated string or primitive values.
**Syntax**: `new RandomListValue(#["value1", "value2", "value3"])`  
**XTend Note**: List literals use the `#[...]` prefix format in MOMoT scripts.

### 2. `RandomIntegerValue`
Selects an integer uniformly at random from a closed interval `[min, max]`.
**Syntax**: `new RandomIntegerValue(min, max)`

### 3. `RandomDoubleValue`
Selects a double floating-point value uniformly at random from a closed interval `[min, max]`.
**Syntax**: `new RandomDoubleValue(min, max)`

---

## The `parameterValues` Block

The `parameterValues` block maps fully-qualified parameter paths (formatted as `"FileName::ModuleName::RuleName::paramName"`) to one of the injection classes.

### ⚠️ IMPORTANT: Fully-Qualified Parameter Path Structure
MOMoT resolves rule parameters using the format `"FileName::ModuleName::RuleName::paramName"` (where `FileName` is the name of the `.henshin` file without its extension, and `ModuleName` is the name of the Henshin module *inside* that file).
- **Example:** If your file is `cra.henshin`, the module name inside is `CRA`, the rule is `createClass`, and the parameter is `className`, the fully-qualified parameter path is `"cra::CRA::createClass::className"`.
- Mismatching this FQN key will cause MOMoT to throw an `IllegalStateException` during execution stating that the parameter value is not set!

### Canonical Example

```
transformations = {
   modules = [ "model/scheduling.henshin" ]
   parameterValues = {
      "scheduling::scheduling::reassignTask::machineId" : new RandomListValue(#["m0", "m1", "m2"])
      "scheduling::scheduling::reassignTask::delayValue" : new RandomIntegerValue(1, 10)
   }
}
```

---

## Excluding Parameters and Units

To avoid searching parameter spaces that should remain static or units that are non-transformational, use `ignoreParameters` and `ignoreUnits`.

### 1. Ignoring Parameters (`ignoreParameters`)
Forces the search to ignore specific rule parameters, preventing MOMoT from randomizing them.
**Syntax**:
```
ignoreParameters = [
   "ModuleName::RuleName::staticParameter"
]
```

### 2. Ignoring Units (`ignoreUnits`)
Excludes certain Henshin rules or units from being selected directly as search operators. This is essential for:
- Helper rules called internally by other units.
- Non-mutating analysis rules.
- Nested conditional units.

**Syntax**:
```
ignoreUnits = [
   "ModuleName::helperRule"
]
```

## Common Errors

**Error:** `Using deprecated RandomStringValue`  
**Root cause:** Attempting to define string arrays using the older `new RandomStringValue("a", "b")` class which is no longer on the default classpath.  
**Fix:** Replace with `new RandomListValue(#["a", "b"])`.

**Error:** `Parameter path typo`  
**Root cause:** Mismatching module or rule names, resulting in MOMoT failing to link the parameter to the Henshin engine. No compilation error is thrown, but rule execution will fail to randomize.  
**Fix:** Check `<henshin:Module name="...">` in the `.henshin` file and ensure casing matches exactly.

## Verification Checklist

- [ ] All parameter paths use `::` as a separator (not `.`).
- [ ] List randomizers use `new RandomListValue(#[...])`.
- [ ] No `RandomStringValue` references are used.
- [ ] Modules and rule names match the `.henshin` exactly (case-sensitive).
- [ ] All units excluded via `ignoreUnits` are valid.
