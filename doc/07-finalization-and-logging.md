# Finalization and Logging

Finalization provides a deterministic end-of-run hook for diagnostics, lightweight summaries, and completion markers.

## Example

```text
finalization = {
    System.out.println("Search finished.")
}
```

## Best practices

- Keep finalization logic lightweight and side-effect minimal.
- Emit concise, parse-friendly log lines.
- Include enough context to identify run completion in `runner.log`.

## Logging goals in headless mode

- Distinguish compile failures from runtime failures.
- Include script-level completion markers when run succeeds.
- Avoid excessive output that obscures errors.

## Troubleshooting usage

- If `exit_code.txt` is non-zero, inspect `runner.log` first.
- If compile errors appear, inspect generated compile log before runtime assumptions.
- If runtime class/package errors appear, verify model package registration and payload validity.

## Validation checklist

- Finalization block compiles under current language/runtime.
- Completion log line appears in successful runs.
- Error logs remain readable and short enough for automation.
