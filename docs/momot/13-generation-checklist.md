# MOMoT Wiki — Chapter 13: The 27-Point Pre-Flight Checklist

This chapter outlines the mandatory 27-point pre-flight checklist that must be executed by any agent before submitting a `.momot` script to the validation and compilation tools. Reviewing these structural, semantic, and syntax rules manually or programmatically dramatically reduces the depth of repair loops and ensures high-quality script generation.

## The 25-Point Checklist (with additions)


### 1. Package FQN Alignment
Verify that the `package` declaration matches the Java package path of the script file location (e.g., `package at.ac.tuwien.big.momot` if in `src/at/ac/tuwien/big/momot/`).

### 2. Model File Path
The `model.file` property must resolve to a valid XMI instance relative to the job root.

### 3. Module reference Path
The `modules` list must point to valid `.henshin` files relative to the job root.

### 4. ignoreUnits Module matching
Any class or unit listed in `ignoreUnits` must match the exact case-sensitive module name defined in the corresponding `.henshin` files.

### 5. ignoreUnits Rule matching
Any rule listed in `ignoreUnits` must exist within the declared Henshin module.

### 6. Fully-Qualified Parameter Path
Ensure that all keys in `parameterValues` use the double-colon syntax (`"ModuleName::RuleName::paramName"`).

### 7. Deprecated RandomStringValue Check
Verify that no `RandomStringValue` references remain. Replace all of them with `new RandomListValue(#["value1", "value2"])`.

### 8. Real OCL Objective Expressions
Verify that no placeholder `{ 0.0 }` expressions are used. Replace them with real, valid OCL strings.

### 9. OCL Model Root Evaluation
Ensure that all OCL expressions evaluate from the model root EClass context.

### 10. OCL Case-Sensitivity Check
Verify that all class, attribute, and reference names used in the OCL expressions match the `.ecore` metamodel exactly.

### 11. Built-In Length Dimension
Use `minimize new TransformationLengthDimension` to minimize the number of transformation steps.

### 12. Solution Repairer Initialization
Always initialize the solution repairer: `solutionRepairer = new TransformationPlaceholderRepairer`.

### 13. Sensible Solution Length
Set `solutionLength` to a value of at least `2` (typically between `5` and `50` depending on problem complexity).

### 14. At least one Algorithm Declared
Ensure that at least one algorithm (e.g., `Random`, `NSGA_II`, or `NSGA_III`) is configured in the `algorithms` block.

### 15. Population Size Bound
Set `populationSize` to a value of at least `10` (standard: `100`).

### 16. Evaluation Count Bound
Set `maxEvaluations` to a value of at least `100` (standard: `2000` to `10000`).

### 17. Number of Runs Check
Set `nrRuns` to a value of at least `1`.

### 18. Reference Front Output File
Verify that the output file for objectives is set to `"out/objectives/overall_objectives.pf"`.

### 19. Solutions Output Directory
Set the solution output directory to `"out/solutions/all/"`.

### 20. Models Output Directory
Set the model output directory to `"out/models/all/"`.

### 21. Clean Imports (No Unused Imports)
Ensure there are no unused Java class imports to avoid compilation warnings or errors.

### 22. Parser Structure Verification
Run structure validation to ensure the MOMoT file parses cleanly (Xtext parse).

### 23. Semantic AST Verification
Run semantic validation to ensure references and objectives resolve against Ecore types.

### 24. Java Class compilation check
Run compile validation to verify the generated Java code compiles successfully.

### 25. No Remaining TODOs
Verify that no `TODO` comments or temporary markers are left in the file before committing.

### 26. Reserved Word Package Import Escaping
Ensure reserved keywords (e.g. `search` and `fitness`) when appearing as segments of an import FQN are escaped with `^` (e.g., `import at.ac.tuwien.big.momot.^search.^fitness...`) to prevent AST resolution errors.

### 27. Output File Specification (Code Generator Bug Bypass)
When configuring results command blocks (like `solutions`), avoid specifying `outputDirectory` without `outputFile` to prevent a NullPointerException in the MOMoT code generator.

## Running Local Validation

Execute the CLI commands in sequence to verify:
```bash
node tools/momot-validator/validate.mjs --validate-structure path/to/Search.momot
node tools/momot-validator/validate.mjs --validate-semantic path/to/Search.momot --project-root path/to/project
node tools/momot-validator/validate.mjs --compile path/to/Search.momot --project-root path/to/project
```
If compile or semantic validation fails, analyze the output to perform automatic repairs.
