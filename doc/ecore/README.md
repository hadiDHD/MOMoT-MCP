# Ecore Wiki — Metamodelling Guide

Welcome to the Ecore Wiki. This dense, agent-optimized knowledge base covers everything needed to model domains for the MOMoT optimization system. Read these chapters sequentially before designing or editing any `.ecore` metamodel.

## Chapter Directory

| Chapter | Title | Focus | Length |
|---|---|---|---|
| [00-overview.md](00-overview.md) | What is Ecore? | Foundational concept, EMF package structure, and root XMI serialization. | ~350 words |
| [01-class-patterns.md](01-class-patterns.md) | EClass Patterns | Modeling inheritance, abstract vs concrete types, and single-containment trees. | ~400 words |
| [02-attribute-types.md](02-attribute-types.md) | EAttribute Types | Mapping domain primitives to EDataTypes, default values, and boundary conditions. | ~350 words |
| [03-reference-patterns.md](03-reference-patterns.md) | EReference Patterns | Containment vs cross-references, single vs multi-valued, and bidirectional opposites. | ~450 words |
| [04-validation-checklist.md](04-validation-checklist.md) | 15-Point Checklist | Quick-scan verification steps before submitting your metamodel to validators. | ~400 words |
| [05-generation-templates.md](05-generation-templates.md) | 4 Canonical Templates | Complete, copy-pasteable XML templates (linear chain, tree, bipartite, registry). | ~600 words |
| [06-debugging-runbook.md](06-debugging-runbook.md) | Top 10 Ecore Errors | Actionable triage runbook for resolving common Ecore syntax/semantic failures. | ~500 words |

## Recommended Reading Order

```
[00-overview] ──► [01-class-patterns] ──► [02-attribute-types] ──► [03-reference-patterns]
                                                                            │
                                                                            ▼
[06-debugging-runbook] ◄── [tools/ecore-validator] ◄── [04-validation-checklist] ◄── [05-generation-templates]
```

## Validation Tooling

After generating or editing any Ecore metamodel, execute the CLI validator tool:
```bash
node tools/ecore-validator/validate.mjs --validate-structure <your-metamodel>.ecore
node tools/ecore-validator/validate.mjs --validate-semantic <your-metamodel>.ecore
```
Refer to [04-validation-checklist.md](04-validation-checklist.md) and [06-debugging-runbook.md](06-debugging-runbook.md) to diagnose and fix validation failures quickly.
