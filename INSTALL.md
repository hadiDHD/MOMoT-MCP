# MOMoT-MCP Installation & Setup Guide (Agent-Optimized)

Follow these steps to fully configure the workspace, compile components, and run verification checks.

> ⚠️ **IMPORTANT AGENT TIMEOUT NOTE:** 
> Downloading, packaging, and compiling the full Maven/Eclipse plugin lifecycle and stripping OSGi signatures inside Docker takes a significant amount of time (typically 3–5 minutes on first run). 
> **You MUST execute all `docker build` commands with an extended tool timeout of at least 10 minutes (600,000 ms) to prevent terminal execution timeout failures.**

---

## Option A: Zero-Dependency Docker Setup (Recommended)

No host dependencies (Java, Maven, etc.) are needed.

### 1. Build and Run the REST Headless Runner
```bash
docker build -t momot-headless -f Dockerfile.headless .
docker run --rm -d -p 8080:8080 --name momot-runner momot-headless
```

### 2. Verify Runner Health
```bash
curl http://localhost:8080/health
```
*(Expected output: `{"status":"UP","health":{"ok":true}}`)*

### 3. Build and Run the MCP Server (Dockerized)
The containerized MCP server includes all validators fully pre-compiled and signature-stripped:
```bash
docker build -t momot-mcp -f mcp/Dockerfile .
docker run --rm -i momot-mcp
```

---

## Option B: Local Host Setup

Requires local Node.js (v20+) and local Java JDK (v17+ or v21+).

### 1. Build and Run the REST Headless Runner
Keep the headless runner running in Docker on port 8080:
```bash
docker build -t momot-headless -f Dockerfile.headless .
docker run --rm -d -p 8080:8080 --name momot-runner momot-headless
```

### 2. Install MCP Server Dependencies
```bash
cd mcp
npm install
```

### 3. Pre-Compile and Setup All Local Validators
```bash
node tools/henshin-validator/validate.mjs --setup
node tools/momot-validator/validate.mjs --setup
node tools/ecore-validator/validate.mjs --setup
node tools/xmi-validator/validate.mjs --setup
```

### 4. Run MCP Unit Tests
```bash
npm test
```

### 5. Start the Local MCP Server
```bash
node server.js
```
