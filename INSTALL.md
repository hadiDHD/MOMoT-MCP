# MOMoT-MCP Installation & Setup Guide (Agent-Optimized)

Follow these steps to fully configure the workspace, compile components, and run verification checks.

> ⚠️ **IMPORTANT AGENT TIMEOUT NOTE:** 
> Downloading, packaging, and compiling the full Maven/Eclipse plugin lifecycle and stripping OSGi signatures inside Docker takes a significant amount of time (typically 3–5 minutes on first run). 
> **You MUST execute all `docker build` commands with an extended tool timeout of at least 10 minutes (600,000 ms) to prevent terminal execution timeout failures.**

---

## Option A: Zero-Dependency Docker Setup (Recommended)

No host dependencies (Java, Maven, etc.) are needed.

### ⚡ Instant Setup using Pre-Built Registry Images (Zero Build Time)
We publish pre-built, production-ready Docker images of both the REST runner and the MCP server directly to the GitHub Container Registry (`ghcr.io`). You can view the packages here: **[hadiDHD's Public MOMoT-MCP Packages](https://github.com/hadiDHD?tab=packages&repo_name=MOMoT-MCP)**.

Pull and run them instantly:

#### 1. Run the REST Headless Runner
```bash
docker run --rm -d -p 8080:8080 --name momot-runner ghcr.io/hadidhd/momot-headless:latest
```

#### 2. Verify Runner Health
```bash
curl http://localhost:8080/health
```
*(Expected output: `{"status":"UP","health":{"ok":true}}`)*

#### 3. Run the MCP Server (Dockerized)
The containerized MCP server includes all validators fully pre-compiled and signature-stripped:
```bash
docker run --rm -i ghcr.io/hadidhd/momot-mcp:latest
```

---

### 🛠️ Alternative: Build Images Locally (Takes ~3–5 Minutes)

#### 1. Build and Run the REST Headless Runner
```bash
docker build -t momot-headless -f Dockerfile .
docker run --rm -d -p 8080:8080 --name momot-runner momot-headless
```

#### 2. Verify Runner Health
```bash
curl http://localhost:8080/health
```
*(Expected output: `{"status":"UP","health":{"ok":true}}`)*

#### 3. Build and Run the MCP Server (Dockerized)
The containerized MCP server includes all validators fully pre-compiled and signature-stripped:
```bash
docker build -t momot-mcp -f mcp/Dockerfile .
docker run --rm -i momot-mcp
```

---

## Option B: Local Host Setup

Requires local Node.js (v20+) and local Java JDK (v17+ or v21+).

### ⚡ Host Setup Hack: Pull Pre-Built Validator Libraries (Saves 5 Minutes!)
Since a fresh clone starts with empty validator directories (binaries are not in Git), running the validators on your host for the first time normally triggers a 5-minute compilation and download process. 

You can bypass this completely and **instantly extract our pre-compiled libraries from our public registry image** onto your host in under 10 seconds:
```bash
docker create --name temp-mcp ghcr.io/hadidhd/momot-mcp:latest
docker cp temp-mcp:/app/tools/. tools/
docker rm temp-mcp
```
This instantly populates your local host `tools/` folder with all pre-built `.class` and `.jar` libraries, enabling instant local host validations with zero setup!

---

### 1. Build and Run the REST Headless Runner
Keep the headless runner running in Docker on port 8080:
```bash
docker build -t momot-headless -f Dockerfile .
docker run --rm -d -p 8080:8080 --name momot-runner momot-headless
```

### 2. Install MCP Server Dependencies
```bash
cd mcp
npm install
```

### 3. Run MCP Unit Tests
```bash
npm test
```

### 4. Start the Local MCP Server
```bash
node server.js
```
