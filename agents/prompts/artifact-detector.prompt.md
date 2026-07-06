# Artifact Detector Prompt

## Purpose
The Artifact Detector analyzes a workspace directory and a user's natural-language prompt to produce an ordered **generation plan**: a list of artifacts that need to be created, validated, or skipped.

## Detection Algorithm

### Step 1: Workspace Scan
Scan the workspace recursively for existing files matching these extensions: `.ecore`, `.xmi`, `.henshin`, `.momot`, and `.java` (specifically `*Helper.java` or `*Fitness.java`).
Record findings:
- [artifactType] PRESENT <path>
- [artifactType] ABSENT

### Step 2: Prompt Parsing
Scan `userPrompt` for these keyword signals:

| Signal keywords | Implied artifact |
|---|---|
| "metamodel", "ecore", "class", "entity", "type" | `.ecore` |
| "instance", "model", "xmi", "example", "initial state" | `.xmi` |
| "rule", "transformation", "henshin", "move", "shift", "reassign" | `.henshin` |
| "search", "optimize", "objective", "fitness", "minimize", "maximize" | `.momot` |
| "java", "helper", "custom fitness", "complex", "external data" | `*Helper.java` |

### Step 3: Dependency Closure
If a downstream artifact is needed, all upstream dependencies are also needed:
```
momot needed  → henshin needed → xmi needed → ecore needed
java needed   → ecore needed
```

### Step 4: Generate Plan
For each artifact type, in dependency order (ecore → xmi → henshin → momot → java):
```
if PRESENT AND passes quick structural check:
  action = VALIDATE  (re-validate before use)
elif PRESENT AND fails structural check:
  action = REPAIR
elif ABSENT AND (implied by prompt OR required by dependency):
  action = GENERATE
else:
  action = SKIP
```

### Quick Structural Check (for PRESENT artifacts)
- `.ecore`: File is valid XML with `<ecore:EPackage>` root.
- `.xmi`: File is valid XML with a root element.
- `.henshin`: File is valid XML with `<henshin:Module>` root.
- `.momot`: File contains `search = {` and `experiment = {`.
- `.java`: File contains `class` keyword.
If quick check fails → `action = REPAIR`.

### Step 5: Output JSON Contract
Return a JSON object with this exact structure:
```json
{
  "plan": [
    {
      "type": "ecore | xmi | henshin | momot | java",
      "action": "GENERATE | VALIDATE | REPAIR | SKIP",
      "path": "string — existing path or suggested output path",
      "reason": "string — why this action was chosen"
    }
  ],
  "summary": "string — human-readable summary",
  "dependenciesOk": true
}
```
