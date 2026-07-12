# Search and Experiment

The `search` and `experiment` blocks define the optimization process, runtime cost, and reproducibility profile.

## Core structure

```text
search = {
	model = {
		file = "model/model.xmi"
	}
	solutionLength = 10
	transformations = {
		modules = [ "transformations/rules.henshin" ]
	}
	algorithms = {
		Random : 1
	}
}

experiment = {
	populationSize = 100
	maxEvaluations = 10000
	nrRuns = 1
}
```

## Tuning recommendations

- Start with tiny settings for smoke tests (`populationSize=1`, `maxEvaluations=1`).
- Increase `maxEvaluations` gradually to control runtime.
- Keep `nrRuns` low while debugging correctness.

## Algorithm notes

- Algorithm configuration must be syntactically and semantically valid for the MOMoT language version in use.
- If an algorithm declaration causes generated Java type errors, simplify to a known-good baseline and reintroduce options gradually.

## Reproducibility practices

- Keep script and input data immutable per run.
- Store exact script and payload used for each experiment.
- Version objective and transformation changes together.

## Validation checklist

- `search` includes model and transformation context.
- `experiment` has finite, positive values.
- Smoke-test settings succeed before full-scale runs.
