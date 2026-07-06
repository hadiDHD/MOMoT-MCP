# MOMoT Wiki Supplement

This supplement adds advanced chapters 10–13 to the existing MOMoT documentation (chapters 00–09). These chapters focus on OCL objective expressions, parameter value injection, custom Java helpers, and pre-flight validation checklists.

## Existing Chapters (00–09) Summary

- **Chapter 00**: Architecture & Topology overview.
- **Chapter 01**: Package structure and Entrypoints.
- **Chapter 02**: Input models and workspace Paths.
- **Chapter 03**: Imports and Henshin module references.
- **Chapter 04**: Objectives and Fitness definitions.
- **Chapter 05**: Search and Experiment configuration.
- **Chapter 06**: Results extraction and output Layout.
- **Chapter 07**: Finalization and runtime Logging.
- **Chapter 08**: Validation and repair Runbook.
- **Chapter 09**: Minimal working Test Case.

## Supplement Chapter Directory

| Chapter | Title | Focus | Length |
|---|---|---|---|
| [10-ocl-expressions.md](10-ocl-expressions.md) | 20 Worked OCL Expressions | Library of OCL fitness functions across 5 different problem domains. | ~500 words |
| [11-parameter-injection.md](11-parameter-injection.md) | Parameter Injection | Wiring Henshin rule randomizers and parameter value mappings. | ~350 words |
| [12-java-helper-integration.md](12-java-helper-integration.md) | Java Helper Integration | Referencing custom fitness functions and compiling Java helpers. | ~350 words |
| [13-generation-checklist.md](13-generation-checklist.md) | 25-Point Checklist | Comprehensive pre-flight check before compilation and execution. | ~400 words |

## Recommended Supplement Reading Order

```
[10-ocl-expressions] ──► [11-parameter-injection] ──► [12-java-helper-integration]
                                                                  │
                                                                  ▼
[MOMoT Execution] ◄── [tools/momot-validator] ◄── [13-generation-checklist]
```

## Validation Tooling

To validate your generated `.momot` scripts locally before submitting to the REST runner, use the MOMoT Validator CLI:
```bash
node tools/momot-validator/validate.mjs --validate-structure path/to/Search.momot
node tools/momot-validator/validate.mjs --validate-semantic path/to/Search.momot --project-root path/to/project
node tools/momot-validator/validate.mjs --compile path/to/Search.momot --project-root path/to/project
```
Refer to [13-generation-checklist.md](13-generation-checklist.md) to ensure all 25 points are fully satisfied.
