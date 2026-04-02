# Objectives and Fitness

Use small, parseable objective definitions with explicit `minimize` or `maximize` clauses.

```text
fitness = {
	objectives = {
		FirstObjective : minimize { 0.0 }
		SolutionLength : minimize new TransformationLengthDimension
	}
}
```
