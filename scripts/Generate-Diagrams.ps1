<#
.SYNOPSIS
  Generate PlantUML documentation diagrams for MOMoT 2.0 and render via local Kroki.

.DESCRIPTION
  Each diagram is defined as a named PlantUML source in the $Diagrams hashtable.
  To add a new diagram, append an entry. Re-running the script overwrites existing
  images for the current date.

.PARAMETER KrokiUrl
  Base URL of the local Kroki instance (default: http://localhost:8084).

.PARAMETER OutputDir
  Directory for rendered PNGs (default: images/ in repo root).

.PARAMETER DiagramFilter
  Optional wildcard filter to render only matching diagrams (e.g. "arch*").

.EXAMPLE
  .\scripts\Generate-Diagrams.ps1
  .\scripts\Generate-Diagrams.ps1 -DiagramFilter "mcp*"
  .\scripts\Generate-Diagrams.ps1 -KrokiUrl http://localhost:9090
#>
param(
    [string]$KrokiUrl = "http://localhost:8084",
    [string]$OutputDir = "",
    [string]$DiagramFilter = "*"
)

$ErrorActionPreference = "Stop"
$DatePrefix = Get-Date -Format "yyyyMMdd"

if ($OutputDir -eq "") {
    $OutputDir = Join-Path $PSScriptRoot "..\images"
}
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# ---------------------------------------------------------------------------
# Diagram definitions — add new entries here
# ---------------------------------------------------------------------------
$Diagrams = [ordered]@{}

# --- 1. Architecture Overview ---
$Diagrams["architecture_overview"] = @'
@startuml
!theme plain
skinparam backgroundColor #FEFEFE
skinparam componentStyle rectangle
skinparam defaultTextAlignment center

title MOMoT 2.0 - Standalone Architecture

actor "LLM / User" as llm

package "Host (Windows / Linux)" {
    component "MCP Server\n(Node.js, stdio)" as mcp {
    }
    note right of mcp
      6 tools exposed via
      @modelcontextprotocol/sdk
      server.js
    end note
}

package "Docker Container" <<rectangle>> {
    component "REST Server\n(Java 21, port 8080)" as rest {
    }
    component "MOMoT Engine\n(Tycho/MOEA)" as engine
    component "Ecore Registry\n(auto-register)" as registry
    database "/work\n(job workspace)" as workdir

    rest --> engine : compile + run\n.momot script
    engine --> registry : resolve\nEPackages
    engine --> workdir : read input\nwrite output
}

llm -down-> mcp : tool call\n(stdio JSON-RPC)
mcp -down-> rest : POST /run\nzip-in / zip-out
rest -down-> engine

note bottom of rest
  Endpoints:
  GET  /health
  GET  /docs  (Swagger UI)
  GET  /openapi.json
  POST /run?script=...
end note
@enduml
'@

# --- 2. Zip Protocol Sequence ---
$Diagrams["zip_protocol_sequence"] = @'
@startuml
!theme plain
skinparam backgroundColor #FEFEFE

title MOMoT REST Protocol - Zip-in / Zip-out

participant "MCP Client\n(lib.js)" as client
participant "REST Server\n(:8080)" as server
participant "MOMoT Engine" as engine
database "/work" as work

== Health Check ==
client -> server : GET /health
server --> client : { "status": "ok" }

== Job Execution ==
client -> client : buildJobZip()\nPack files as base64 into ZIP

client -> server : POST /run?script=src/.../Example.momot\nContent-Type: application/zip\n[request.zip]

server -> work : Extract ZIP to /work
server -> engine : MomotScriptCompiler.compile(script)
engine -> engine : Register EPackages\nLoad Henshin rules\nRun NSGA-II / NSGA-III

engine --> server : Execution complete\n(exit_code, artifacts in /out)

server -> server : Package response ZIP:\n  runner/exit_code.txt\n  runner/request.json\n  runner/runner.log\n  runner/compile.log\n  out/**  (solutions, models)

server --> client : 200 OK\nContent-Type: application/zip\n[response.zip]

client -> client : parseResponseZip()\nExtract exit_code, logs, outputs
@enduml
'@

# --- 3. MCP Tools ---
$Diagrams["mcp_tools"] = @'
@startuml
!theme plain
skinparam backgroundColor #FEFEFE
skinparam packageStyle frame

title MOMoT MCP Server - Tool Map (v1.1.0)

package "momot-mcp (stdio)" {

    package "Core Tools" <<rectangle>> #E8F5E9 {
        component "generate_artifacts_from_ecore" as gen
        component "execute_momot_job" as exec
        component "run_end_to_end" as e2e
    }

    package "Convenience Tools" <<rectangle>> #E3F2FD {
        component "momot_generate" as scaffold
        component "momot_validate" as validate
        component "momot_run" as run
    }
}

component "REST Server\n/run" as rest #FFF3E0

gen -[hidden]down-> exec
exec -[hidden]down-> e2e

e2e ..> gen : calls\n(generate)
e2e ..> exec : calls\n(execute)
run ..> exec : delegates

exec --> rest : POST /run\nzip-in/zip-out

note bottom of gen
  Input: .ecore (content or path)
  Output: .momot script, .henshin,
  .xmi model, optional Java helper
  All as base64 filesBase64 map
end note

note bottom of exec
  Input: scriptPath + filesBase64
  Output: exitCode, logTail,
  outputs[], diagnostics
end note

note right of scaffold
  Generates .momot
  script skeleton
  from prompt
end note
@enduml
'@

# --- 4. Maven Build Modules ---
$Diagrams["maven_modules"] = @'
@startuml
skinparam shadowing false

title MOMoT 2.0 - Maven Module Dependencies (Docker Build)

component "momot.tooling" as tooling
component "big.moea" as moea
component "momot.core" as core
component "momot.lang" as lang
component "momot.runner" as runner

moea --> core : dependency
core --> runner : classpath
lang --> runner : jar copied
tooling --> lang : target platform

note right of runner
  Packaging: jar
  Main: RestServerMain
  Also: RunnerMain (CLI)
end note

note right of lang
  Packaging: eclipse-plugin
  xtend.skip=true
  uses xtend-gen/
end note

note bottom of moea
  MOEA Framework wrapper
end note

note top of tooling
  Target platform definition
end note
@enduml
'@

# --- 5. Docker Image Layers ---
$Diagrams["docker_layers"] = @'
@startuml
!theme plain
skinparam backgroundColor #FEFEFE

title MOMoT Docker Image - Build Stages

rectangle "Stage 1: BUILD" as build #E3F2FD {
    card "maven:3.9-eclipse-temurin-21" as base1
    card "mvn -pl ... -Dxtend.skip=true\nclean package" as mvn
    card "Copy jars to /app/repository/plugins/" as copy
    card "Download OCL, Henshin,\nNashorn, ASM jars" as download
    card "Strip jar signatures" as strip
    base1 -down-> mvn
    mvn -down-> copy
    copy -down-> download
    download -down-> strip
}

rectangle "Stage 2: RUNTIME" as runtime #E8F5E9 {
    card "eclipse-temurin:21-jdk" as base2
    card "WORKDIR /work" as workdir
    card "COPY --from=build\n/app/repository" as copyrt
    card "ENTRYPOINT java -cp\n/app/repository/plugins/*\nRestServerMain" as entry
    base2 -down-> workdir
    workdir -down-> copyrt
    copyrt -down-> entry
}

build -right-> runtime : multi-stage\ncopy artifacts
@enduml
'@

# ---------------------------------------------------------------------------
# Rendering engine
# ---------------------------------------------------------------------------
$KrokiEndpoint = "$KrokiUrl/plantuml/png"
$rendered = 0
$failed = 0

Write-Host ""
Write-Host "=== MOMoT 2.0 Diagram Generator ===" -ForegroundColor Cyan
Write-Host "Kroki endpoint : $KrokiEndpoint"
Write-Host "Output directory: $OutputDir"
Write-Host "Date prefix     : $DatePrefix"
Write-Host "Filter          : $DiagramFilter"
Write-Host ""

# Test Kroki connectivity
try {
    $healthResponse = Invoke-WebRequest -Uri "$KrokiUrl/plantuml/png" -Method POST `
        -ContentType "text/plain" -Body "@startuml`ntitle test`n@enduml" `
        -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    if ($healthResponse.StatusCode -ne 200) {
        Write-Host "[ERROR] Kroki returned status $($healthResponse.StatusCode)" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Kroki is reachable" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Cannot reach Kroki at $KrokiUrl" -ForegroundColor Red
    Write-Host "        Make sure Kroki is running (Switch-Stack.ps1 homelab)" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

foreach ($name in $Diagrams.Keys) {
    if ($name -notlike $DiagramFilter) {
        continue
    }

    $source = $Diagrams[$name]
    $filename = "${DatePrefix}_${name}.png"
    $outPath = Join-Path $OutputDir $filename

    Write-Host "  Rendering: $name" -NoNewline

    try {
        $response = Invoke-WebRequest -Uri $KrokiEndpoint -Method POST `
            -ContentType "text/plain; charset=utf-8" `
            -Body $source -TimeoutSec 30 -UseBasicParsing -ErrorAction Stop

        if ($response.StatusCode -eq 200) {
            [System.IO.File]::WriteAllBytes($outPath, $response.Content)
            $sizeKB = [math]::Round((Get-Item $outPath).Length / 1024, 1)
            Write-Host "  -> OK (${sizeKB} KB)" -ForegroundColor Green

            $fullPath = (Resolve-Path $outPath).Path
            Write-Host "     file:///$($fullPath -replace '\\','/')" -ForegroundColor DarkGray
            $rendered++
        }
        else {
            Write-Host "  -> FAILED (HTTP $($response.StatusCode))" -ForegroundColor Red
            $failed++
        }
    }
    catch {
        Write-Host "  -> ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "=== Done: $rendered rendered, $failed failed ===" -ForegroundColor Cyan
Write-Host ""

if ($rendered -gt 0) {
    Write-Host "Open all in browser:" -ForegroundColor Yellow
    foreach ($name in $Diagrams.Keys) {
        if ($name -notlike $DiagramFilter) { continue }
        $filename = "${DatePrefix}_${name}.png"
        $outPath = Join-Path $OutputDir $filename
        if (Test-Path $outPath) {
            $fullPath = (Resolve-Path $outPath).Path
            Write-Host "  start `"$fullPath`""
        }
    }
}
