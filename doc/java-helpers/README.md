# Java-Helpers Wiki — Custom Java Logic Guide

Welcome to the Java-Helpers Wiki. This dense, agent-optimized knowledge base covers when and how to implement custom Java classes to handle complex search spaces, customized fitness logic, and external data lookup in the MOMoT framework.

## Chapter Directory

| Chapter | Title | Focus | Length |
|---|---|---|---|
| [00-overview.md](00-overview.md) | When Java is Needed | Decision tree comparing OCL vs Java, and classpath setup. | ~350 words |
| [01-custom-fitness.md](01-custom-fitness.md) | Custom Fitness | Inheriting from AbstractEGraphFitness and navigating model objects. | ~400 words |
| [02-custom-operators.md](02-custom-operators.md) | Custom Operators | Implementing domain-specific mutations via the MOEA Mutation interface. | ~350 words |
| [03-ocl-alternative.md](03-ocl-alternative.md) | OCL Alternatives | Known OCL design limitations (recursion, API calls) and Java fixes. | ~400 words |
| [04-validation-checklist.md](04-validation-checklist.md) | Validation Checklist | Structural and compile-time verification steps for custom Java code. | ~350 words |
| [05-templates.md](05-templates.md) | 3 Canonical Templates | Copy-pasteable BFS graph metric, external cost matrix CSV, and caching. | ~600 words |
| [06-debugging-runbook.md](06-debugging-runbook.md) | Top 5 Helper Errors | Triage guide for compile-time classpath and runtime NPE/Cast issues. | ~350 words |

## Recommended Reading Order

```
[00-overview] ──► [01-custom-fitness] ──► [03-ocl-alternative]
                                                     │
                                                     ▼
[06-debugging-runbook] ◄── [javac compilation] ◄── [04-validation-checklist] ◄── [05-templates]
```

## Integration with MOMoT Scripts

For step-by-step instructions on importing and referencing your compiled Java helper inside your declarative `.momot` scripts, see [doc/momot/12-java-helper-integration.md](../momot/12-java-helper-integration.md).
