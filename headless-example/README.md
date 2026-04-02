# Headless MOMoT Example

This folder documents the minimal end-to-end flow against the REST runner container.

1. Build the runner image with `Dockerfile` or `Dockerfile.core`.
2. Package a job zip containing `program.jar` and any supporting model or Henshin files.
3. POST the zip to `http://localhost:8080/run?mainClass=<your.main.Class>` with `Content-Type: application/zip`.
4. Inspect the returned zip for `runner/runner.log`, `runner/exit_code.txt`, and any files produced under `out/`.
