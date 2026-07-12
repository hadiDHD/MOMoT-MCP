# Package and Entry Points

This section defines the top-level script identity and the generated Java entry point assumptions.

## Why it matters

- The script `package` contributes to the generated Java class namespace.
- The script file name and declared model name influence the resolved main class.
- Stable naming prevents runtime invocation errors in headless execution.

## Rules

1. Use a deterministic package name (for example `momot.search` or project-specific namespace).
2. Keep script file names Java-class friendly (letters, numbers, underscore, no spaces).
3. Avoid renaming script files between compilation and execution phases in automation.

## Minimal template

```text
package momot.search

search = {
	model = {
		file = "model/model.xmi"
	}
}

experiment = {
	populationSize = 1
	maxEvaluations = 1
	nrRuns = 1
}
```

## Naming recommendations

- Prefer lower-case package segments.
- Keep package depth small (2-4 segments).
- Keep script file names short and descriptive, such as `repair.momot` or `allocation.momot`.

## Common pitfalls

- Package declared in script does not match expected classpath assumptions.
- Script renamed but client still calls old main class.
- Non-ASCII or punctuation in file names causes generated Java naming issues.

## Validation checklist

- `package` declaration exists and is non-empty.
- Script file name can map cleanly to a Java class name.
- CI job uses the same script path in zip packaging and API query parameters.
