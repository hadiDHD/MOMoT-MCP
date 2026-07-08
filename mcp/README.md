# MOMoT MCP Server Usage

This MCP server exposes tools for artifact generation and REST execution through the existing MOMoT runner endpoint.

## Release status (v2.0.0)

All 12 tools in the exposed tool surface form the fully validated and supported functional subset covered by automated tests.

### Tool surface overview

| Tool | Group | Tested |
|------|-------|--------|
| `detect_artifacts` | Validated | Unit |
| `generate_ecore` | Validated | Unit |
| `generate_xmi` | Validated | Unit |
| `generate_henshin` | Validated | Unit |
| `generate_momot` | Validated | Unit |
| `validate_ecore` | Validated | Unit |
| `validate_xmi` | Validated | Unit |
| `validate_henshin` | Validated | Unit |
| `validate_momot` | Validated | Unit |
| `validate_java_helper` | Validated | Unit |
| `generate_java_helper` | Validated | Unit |
| `execute_momot_job` | Validated | Unit + integration + stdio |

## Tools (validated functional subset)

### detect_artifacts
Scans workspace directory recursively and parses user natural-language prompt to determine what files already exist and which need to be generated/repaired, producing an ordered Generation Plan.

### generate_ecore
Generates a structurally and semantically valid `.ecore` metamodel from a natural-language description using a selected metamodel template pattern.

### generate_xmi
Generates a valid initial `.xmi` model instance matching the specified Ecore metamodel and initial worst-case "bad start" sizing requirements.

### generate_henshin
Generates a well-formed, syntactically and semantically valid `.henshin` transformation rule file from an Ecore metamodel and natural-language description.

### generate_momot
Generates a well-formed, declarative `.momot` search script that references the specified Ecore, model XMI, and Henshin rule modules, alongside objective hints.

### validate_ecore
Validates a `.ecore` metamodel using the Ecore CLI validator at structural and semantic validation tiers.

### validate_xmi
Validates a `.xmi` model instance file at structural, semantic, and programmatic EMF load tiers.

### generate_java_helper
Generates a custom Java helper class extending `AbstractEGraphFitness` for advanced fitness objectives using one of three canonical shapes (graph-metric, external-data, or cached).

### execute_momot_job
Input schema highlights:
- scriptPath (required)
- filesBase64 (required)
- restBaseUrl (optional, default http://localhost:8080)
- requestTimeoutMs, retries, retryDelayMs, logTailLines (optional)

Output envelope:
- success
- exitCode
- scriptPath
- generatedFiles
- warnings
- summary
- logTail
- outputs
- diagnostics

### validate_henshin
Wraps `tools/henshin-validator/validate.mjs` for local Henshin rule validation.

Input schema highlights:
- henshinPath (required)
- mode: `structure` | `semantic` | `apply` (default `structure`)
- metamodelPath (required for `semantic` and `apply`)
- modelPath, ruleName (required for `apply`)
- parameters (optional string map for rule parameters)

### validate_momot
Wraps `tools/momot-validator/validate.mjs` for local `.momot` script validation.

Input schema highlights:
- momotPath (required)
- mode: `structure` | `semantic` | `compile` (default `structure`)
- projectRoot (recommended for `semantic` and `compile` when script paths are job-relative)

Output envelope:
- success
- exitCode
- result (parsed JSON from validator stdout)
- stderr (optional)

### validate_java_helper
Performs static conformance and structural analysis of a custom Java helper class to verify package structures, class definitions, inheritance from AbstractEGraphFitness, and correct override signatures.

## Example MCP Request Payloads

Execution:

{
  "restBaseUrl": "http://localhost:8080",
  "scriptPath": "src/at/ac/tuwien/big/momot/examples/stack/StackSearchExample.momot",
  "filesBase64": {
    "src/at/ac/tuwien/big/momot/examples/stack/StackSearchExample.momot": "<base64>",
    "model/stack.ecore": "<base64>",
    "model/stack.henshin": "<base64>",
    "model/input/model/model_five_stacks.xmi": "<base64>"
  }
}

## Example Successful Response Shape

{
  "success": true,
  "exitCode": 0,
  "scriptPath": "src/at/ac/tuwien/big/momot/examples/stack/StackSearchExample.momot",
  "generatedFiles": [
    "model/input/model/model_five_stacks.xmi",
    "model/stack.ecore",
    "model/stack.henshin",
    "src/at/ac/tuwien/big/momot/examples/stack/StackSearchExample.momot"
  ],
  "warnings": [],
  "summary": "Execution succeeded with 18 output artifact(s).",
  "logTail": "...",
  "outputs": [],
  "diagnostics": {
    "health": { "ok": true, "statusCode": 200 },
    "requestUrl": "http://localhost:8080/run?script=...",
    "statusCode": 200,
    "request": { "script": "..." },
    "rootCauseHint": "Execution succeeded."
  }
}

## Troubleshooting

- REST unavailable:
  - Verify container is running.
  - Check http://localhost:8080/health returns ok.
- Script not found in archive:
  - Ensure scriptPath exactly matches zip entry path.
  - Use forward slashes only.
- Compile failures:
  - Inspect diagnostics.logTail for compile section.
  - Validate generated script imports and objective blocks.
- Model/metamodel mismatches:
  - Check Ecore nsURI and model root compatibility.
- Non-zero exit code:
  - Use diagnostics.rootCauseHint and logTail for triage.

Note:
- outputs is always returned as a list and may be empty when the executed MOMoT script does not emit artifacts under out/.

## Verification Commands

From mcp directory:

npm install
npm test

With REST container running (integration tests):

$env:RUN_INTEGRATION_TESTS='1'
$env:MOMOT_REST_BASE_URL='http://localhost:8080'
npm run test:integration

With REST container running (MCP stdio protocol tests):

$env:RUN_MCP_STDIO_TESTS='1'
$env:MOMOT_REST_BASE_URL='http://localhost:8080'
npm run test:stdio

