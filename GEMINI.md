# MOMoT + MCP Operating Context

This repository contains MOMoT (model transformation + search-based optimization) and an MCP server that can generate and execute MOMoT jobs.

## Primary Goal

When helping in this workspace:
- Use the MCP server `momot-mcp` for generation/execution tasks.
- Prepare valid MOMoT artifacts from Ecore/model inputs.
- Interpret execution diagnostics and outputs clearly.
- Prefer deterministic validation paths before custom experiments.

## Repository Facts

- REST runner executes jobs as zip-in/zip-out using `/run?script=<path>`.
- Health endpoint is `/health`.
- Minimal deterministic fixture is in `stack-example-minimal/`.
- MCP implementation is in `mcp/`.

## Henshin Agent

A dedicated Henshin expert agent is available for writing, validating, and testing `.henshin` transformation files.

### Knowledge Base
Full Henshin reference documentation is in `doc/henshin/` (files `00`–`09` + examples).
See imported content at the bottom of this file for details.

### CLI Validators (no Docker needed)

We provide fast local feedback loops using Node.js + EMF CLI validators:
- **Henshin Validator** (`tools/henshin-validator/`):
```bash
# Check XMI structure only (no metamodel required)
node tools/henshin-validator/validate.mjs --validate-structure <file.henshin>

# Resolve all type references against an Ecore metamodel
node tools/henshin-validator/validate.mjs --validate-semantic <file.henshin> --metamodel <file.ecore>

# Apply a named rule to a model instance
node tools/henshin-validator/validate.mjs --apply <file.henshin> --metamodel <file.ecore> --model <file.xmi> --rule <ruleName>
```

- **Ecore Validator** (`tools/ecore-validator/`):
```bash
# Check XML well-formedness and schema compliance
node tools/ecore-validator/validate.mjs --validate-structure <file.ecore>

# Resolve internal opposite references and check package semantics
node tools/ecore-validator/validate.mjs --validate-semantic <file.ecore>
```

- **XMI Validator** (`tools/xmi-validator/`):
```bash
# Check XML well-formedness
node tools/xmi-validator/validate.mjs --validate-structure <file.xmi>

# Validate model instance semantic type resolution against Ecore metamodel
node tools/xmi-validator/validate.mjs --validate-semantic --ecore <file.ecore> <file.xmi>
```
All modes return a single JSON line to stdout. Exit code `0` = success.

### MCP Tool
`validate_henshin` — wraps the CLI validator; callable without shell access.
Required field: `henshinPath`. Optional: `mode` (`structure`|`semantic`|`apply`), `metamodelPath`, `modelPath`, `ruleName`, `parameters`.

### Agent Prompt
Load `.github/prompts/henshin-agent.prompt.md` as the system prompt when working on Henshin tasks.
It references the knowledge base and enforces the two-step validation workflow (structure → semantic → apply → MOMoT).

---

## MCP Tools Available

1. `detect_artifacts`
- Purpose: Scans a workspace recursively and parses a user prompt to determine existing files and needed modifications.
- Input: `workspaceDir` (required), `userPrompt` (required).
- Output: `plan` (JSON array of artifact actions), `summary`.

2. `generate_ecore`
- Purpose: Generates an Ecore metamodel on disk from a natural-language description using a selected architectural pattern.
- Input: `nlDescription` (required), `packageName`, `nsURI`, `outputPath`.

3. `generate_xmi`
- Purpose: Generates a valid starting worst-case imbalanced model instance matching the specified Ecore metamodel.
- Input: `ecorePath` (required), `nlDescription`, `instanceSize`, `outputPath`.

4. `validate_ecore`
- Purpose: Wraps local Ecore CLI validator for structural and semantic checks.
- Input: `ecorePath` (required), `mode` (`structure`|`semantic`).

5. `validate_xmi`
- Purpose: Wraps local XMI CLI validator for XML well-formedness, semantic binding, and programmatic load checks.
- Input: `xmiPath` (required), `mode` (`structure`|`semantic`|`load`), `ecorePath` (required for semantic/load).

6. `generate_java_helper`
- Purpose: Generates a custom Java helper class extending `AbstractEGraphFitness` using copy-pasteable templates.
- Input: `ecorePath` (required), `objectiveDescription` (required), `packageName` (required), `className`, `template`.

7. `generate_artifacts_from_ecore`
- Purpose: Build MOMoT script + related artifacts from metamodel/model context.
- Required input: `ecoreContent` or `ecorePath`.
- Recommended input: `modelContent` or `modelPath`.
- Helpful optional input: `problemDescription`, `objectiveHints`, `packageName`, `className`, `scriptPath`, `henshinPath`, `includeJavaHelper`.
- Key output: `success`, `summary`, `scriptPath`, `generatedFiles` (base64 map), `warnings`, `diagnostics`.

2. `execute_momot_job`
- Purpose: Execute an already prepared MOMoT job through REST.
- Required input: `scriptPath`, `filesBase64`.
- Optional controls: `restBaseUrl` (default `http://localhost:8080`), `requestTimeoutMs`, `retries`, `retryDelayMs`, `logTailLines`.
- Key output: `success`, `exitCode`, `generatedFiles`, `summary`, `logTail`, `outputs`, `diagnostics`.

3. `run_end_to_end`
- Purpose: Combined generate+execute workflow.
- Supports same generation/execution fields and `knownGoodFixture=true` for deterministic smoke validation.

## Input Preparation Rules (Critical)

- Keep all zip/internal paths and `scriptPath` values forward-slash (`/`) relative paths.
- Ensure `scriptPath` exactly matches the script path present in submitted files.
- Preserve Ecore and model compatibility:
  - matching root type expectations,
  - coherent namespace/structure,
  - transformation assumptions reflected in Henshin/script content.
- For first-time checks, prefer:
  - `knownGoodFixture=true` with `run_end_to_end`, or
  - stack example artifacts in `stack-example-minimal/`.

## Output Interpretation Guide

1. Success and termination
- `success=true` plus `exitCode=0` indicates successful execution.
- Non-zero `exitCode` means execution failed even if artifacts were partially produced.

2. Diagnostics-first triage
- Read `diagnostics.rootCauseHint` first.
- Use `diagnostics.health` and `statusCode` to separate availability errors from model/script errors.
- Inspect `logTail` for compile/runtime stack traces.

3. Expected result shape
- `outputs` is always a list and may be empty when no artifacts are emitted to `out/`.
- `generatedFiles` lists available artifacts from generation/execution phases.

## Preferred Workflow

1. Validate infrastructure with `run_end_to_end` and `knownGoodFixture=true`.
2. Generate artifacts from custom Ecore/model with `generate_artifacts_from_ecore`.
3. Execute with `execute_momot_job`.
4. If failure occurs, report:
- failing phase (generation or execution),
- top root-cause hint,
- minimal remediation steps,
- whether issue is infra, pathing, compile, or model/metamodel mismatch.

## Communication Expectations

When summarizing results:
- Include `success`, `exitCode`, and one-line `summary`.
- Call out warnings distinctly from errors.
- Explain likely domain meaning of outputs (optimization result quality, produced artifacts, or no emitted artifacts).

## Local Validation Commands (for shell use)

From `mcp/`:
- `npm install`
- `npm test`

With REST server running (Note: The default port in this workspace is typically 8081):
- PowerShell (Integration tests via MCP):
  - `$env:RUN_INTEGRATION_TESTS='1'`
  - `$env:MOMOT_REST_BASE_URL='http://localhost:8081'`
  - `npm run test:integration`

- PowerShell (Direct REST minimal fixture test):
  - `../scripts/run-minimal-rest-test.ps1 -Port 8081`


## Imported Source Material

The following files are imported to provide full, authoritative details.

@./mcp/README.md
@./doc/README.md
@./doc/08-validation-and-runbook.md
@./doc/09-minimal-test-case.md
@./doc/henshin/README.md
@./tools/henshin-validator/README.md
