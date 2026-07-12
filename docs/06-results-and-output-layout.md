# Results and Output Layout

The result layout should make it easy to inspect optimizer artifacts and automate post-processing.

## Recommended script output block

```text
results = {
    models = {
        outputDirectory = "out/models/"
    }
}
```

## Returned response bundle expectations

In the headless REST flow, expect at least:

- `runner/runner.log`
- `runner/exit_code.txt`
- `runner/request.json`
- compile artifacts (when compilation succeeded)
- model/result outputs under configured `out/` paths (when execution succeeded)

## Organization guidelines

- Keep all script-generated outputs under `out/`.
- Separate generated models from logs and diagnostics.
- Avoid writing to parent directories.

## Error interpretation

- Compile success with empty `out/` often means runtime failed before result generation.
- `exit_code.txt` is the quickest machine-readable run success indicator.

## Validation checklist

- `results` block is present for scripts expected to emit models.
- Output directory path is relative and writable.
- Post-run automation checks both `exit_code.txt` and expected output files.
