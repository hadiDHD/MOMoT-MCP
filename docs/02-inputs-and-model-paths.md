# Inputs and Model Paths

Headless execution is path-sensitive. Input resources must be resolvable from the extracted job directory in the container.

## Recommended payload layout

```text
job.zip
|- script.momot
|- model/
|  `- model.xmi
|- transformations/
|  `- rules.henshin
`- other-inputs/
```

## Script path conventions

Use relative paths only:

```text
search = {
	model = {
		file = "model/model.xmi"
	}
}
```

## Do and do not

- Do use forward slashes (`/`) in script paths.
- Do keep paths relative to job root.
- Do include every referenced file in the zip.
- Do not use absolute paths from local developer machines.
- Do not rely on host-specific drives (`C:\...`).
- Do not use path traversal (`../`) in production payloads.

## Portability notes

- Windows-created zip archives can include backslashes in entry names.
- The runtime should normalize entry separators, but scripts should still use `/`.
- Case sensitivity may differ between local machines and Linux containers.

## Data validity notes

- A syntactically valid path can still fail if the model content is not semantically valid.
- Empty root models often compile but fail at runtime when the search expects domain roots.

## Validation checklist

- Every `file` in script points to an existing zip entry.
- No absolute path literals in script.
- Model root object and required package URIs are present.
