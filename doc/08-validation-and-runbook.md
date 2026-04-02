# Validation and Runbook

When generating `.momot` scaffolds, keep the script parseable, avoid path traversal in supporting files, and verify the job runs inside an isolated `/work` mount.

A practical smoke test is:
1. create a zip with `program.jar` and any input files,
2. POST it to `/run?mainClass=...`,
3. confirm the returned zip contains `runner/runner.log` and `runner/exit_code.txt`.
