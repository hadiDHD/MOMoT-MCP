# Validation and Runbook

This runbook validates the full zip-in/zip-out REST execution path and helps isolate failures quickly.

## Pre-flight checks

1. Script parses and references only included files.
2. Model and transformation files are semantically valid for the target metamodel.
3. Docker image builds successfully.
4. Health endpoint responds before test submissions.

## Canonical job zip structure

```text
job.zip
|- script.momot
|- model/
|  `- model.xmi
`- transformations/
	`- rules.henshin
```

## Smoke-test flow

1. Build image:

```powershell
docker build -t momot-rest-test -f Dockerfile .
```

2. Run container:

```powershell
docker run --rm -p 8080:8080 momot-rest-test
```

3. Health check:

```powershell
Invoke-WebRequest http://localhost:8080/health | Select-Object -ExpandProperty Content
```

4. Submit run request (binary zip body):

```powershell
Invoke-WebRequest -Method Post -Uri "http://localhost:8080/run?script=script.momot" -InFile job.zip -ContentType "application/zip" -OutFile response.zip
```

5. Inspect response contents:

- `runner/runner.log`
- `runner/exit_code.txt`
- `runner/request.json`
- expected compile and `out/` artifacts

## Triage decision tree

- Health fails: container or bootstrapping issue.
- Compile fails: script syntax/type/generation issue.
- Runtime fails: model/package/transformations/data issue.
- Exit code non-zero with compile success: semantic input or runtime environment issue.

## Known high-signal error classes

- Missing class (`NoClassDefFoundError`): runtime classpath packaging gap.
- Package not found (`EPackage` URI errors): model/metamodel registration mismatch.
- Empty model root (`IndexOutOfBounds` on contents): invalid model payload.
- Generated Java compile errors: script expression incompatibility.

## CI-friendly assertions

1. `/health` returns success.
2. Response zip is returned for `/run`.
3. `runner/exit_code.txt` equals `0` for known-good fixtures.
4. `out/` contains expected result artifacts.
