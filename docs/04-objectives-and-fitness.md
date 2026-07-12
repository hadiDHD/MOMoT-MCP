# Objectives and Fitness

The `fitness` block defines optimization goals and directly influences search behavior and output quality.

## Objective design principles

1. Keep objective names stable and descriptive.
2. Use explicit direction: `minimize` or `maximize`.
3. Start with simple expressions before adding complex dimensions.
4. Avoid mixed units without clear normalization strategy.

## Example

```text
import at.ac.tuwien.big.momot.search.fitness.dimension.TransformationLengthDimension

fitness = {
    objectives = {
        Baseline : minimize { 0.0 }
        SolutionLength : minimize new TransformationLengthDimension
    }
}
```

## Practical guidance

- Keep an always-valid objective during early script development.
- Add domain-specific objectives incrementally.
- Check objective expressions for type compatibility.

## Common pitfalls

- Objective expression returns wrong type.
- Imported dimension class unavailable in runtime classpath.
- Objective logic references unavailable model features.

## Debugging hints

- If generated Java fails to compile, inspect objective expression translation first.
- If runtime fails after compile, inspect model access assumptions in objective logic.

## Validation checklist

- Every objective has a unique name.
- Every objective has explicit direction.
- All imported objective helpers resolve at compile time.
