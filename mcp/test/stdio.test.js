// MCP stdio protocol tests.
//
// Exercises the JSON-RPC surface of mcp/server.js end-to-end: handshake,
// tools/list, tools/call, schema validation, envelope shape. Bypasses nothing.
//
// Guarded by RUN_MCP_STDIO_TESTS=1 (same pattern as integration.test.js).
// The run_end_to_end test additionally requires MOMOT_REST_BASE_URL and a
// healthy REST container; it is auto-skipped otherwise.
//
// Run directly:
//   $env:RUN_MCP_STDIO_TESTS = '1'
//   $env:MOMOT_REST_BASE_URL = 'http://localhost:8085'
//   npm run test:stdio

import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Fixtures / constants

const SERVER_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'server.js'
);

// Tools that are part of the active, validated functional subset.
const VALIDATED_TOOLS = [
  'execute_momot_job',
  'validate_henshin',
  'validate_momot',
  'detect_artifacts',
  'generate_ecore',
  'generate_xmi',
  'generate_henshin',
  'generate_momot',
  'validate_ecore',
  'validate_xmi',
  'validate_java_helper',
  'generate_java_helper'
];

// Minimal but well-formed Ecore. Enough for generateArtifactsFromEcore to
// produce deterministic output without exercising corner cases.
const MIN_ECORE = `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore" name="demo" nsURI="http://example/demo/1.0">
  <eClassifiers xsi:type="ecore:EClass" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" name="Model"/>
</ecore:EPackage>`;

// ---------------------------------------------------------------------------

if (process.env.RUN_MCP_STDIO_TESTS !== '1') {
  test('stdio tests skipped (set RUN_MCP_STDIO_TESTS=1 to enable)', () => {});
} else {

  // Shared client across tests to avoid N * spawn overhead (~300 ms each).
  // Server is stateless across calls; sharing is safe.
  let client;
  let transport;

  before(async () => {
    transport = new StdioClientTransport({
      command: 'node',
      args: [SERVER_PATH],
      // Forward full env so the child inherits MOMOT_REST_BASE_URL and any
      // other test-relevant vars. StdioClientTransport also accepts a curated
      // env subset via getDefaultEnvironment(), but we prefer full visibility.
      env: { ...process.env },
      // 'pipe' keeps stderr out of the test runner output unless something
      // goes wrong; for verbose debugging, switch to 'inherit'.
      stderr: 'pipe'
    });

    client = new Client(
      { name: 'momot-mcp-stdio-test', version: '1.0.0' },
      {}
    );

    await client.connect(transport);
  });

  after(async () => {
    if (client) {
      try {
        await client.close();
      } catch {
        // ignore: transport may already be closed if a test crashed the server
      }
    }
  });

  // -------------------------------------------------------------------------
  // Test 1: handshake

  test('initialize handshake returns expected server name and version', () => {
    const info = client.getServerVersion();
    assert.ok(info, 'Server info should be populated after connect()');
    assert.equal(info.name, 'momot-mcp', `Unexpected server name: ${info.name}`);
    assert.equal(info.version, '1.1.0', `Unexpected server version: ${info.version}`);
  });

  // -------------------------------------------------------------------------
  // Test 2: tools/list

  test('tools/list includes the validated functional subset (PoC extras allowed)', async () => {
    const { tools } = await client.listTools();
    const names = tools.map(t => t.name);

    // Assertion 1: every validated tool must be present.
    for (const expected of VALIDATED_TOOLS) {
      assert.ok(
        names.includes(expected),
        `Validated tool '${expected}' missing from tools/list. Got: ${names.join(', ')}`
      );
    }

    // Assertion 2: each validated tool must have a well-formed object schema.
    const validatedTools = tools.filter(t => VALIDATED_TOOLS.includes(t.name));
    for (const tool of validatedTools) {
      assert.equal(
        tool.inputSchema?.type,
        'object',
        `Tool ${tool.name} should declare inputSchema.type === 'object'`
      );
      assert.ok(
        tool.inputSchema.properties,
        `Tool ${tool.name} should declare inputSchema.properties`
      );
      assert.ok(
        Object.keys(tool.inputSchema.properties).length > 0,
        `Tool ${tool.name} inputSchema.properties should not be empty`
      );
    }

    // Informational: PoC / unvalidated extras are surfaced in the log but
    // do not fail the test. This is the "S0 smoke" for alias tools in
    // v2.0.0-alpha.1 (presence reported, behavior unchecked).
    const unvalidatedExtras = names.filter(n => !VALIDATED_TOOLS.includes(n));
    if (unvalidatedExtras.length > 0) {
      console.log(
        `[info] tools/list returned ${tools.length} tool(s) total; ` +
        `validated subset: ${VALIDATED_TOOLS.length} ` +
        `(${VALIDATED_TOOLS.join(', ')}); ` +
        `PoC / unvalidated extras: ${unvalidatedExtras.length} ` +
        `(${unvalidatedExtras.join(', ')})`
      );
    } else {
      console.log(
        `[info] tools/list returned ${tools.length} tool(s), ` +
        `all part of the validated subset`
      );
    }
  });

  // -------------------------------------------------------------------------
  // Test 4: execute_momot_job with missing required fields

  test('execute_momot_job with empty arguments is rejected cleanly', async () => {
    // Zod schema declares scriptPath and filesBase64 required. Empty args
    // should either:
    //   (a) cause callTool() to reject with a JSON-RPC error, OR
    //   (b) return an envelope with isError: true
    // Both are acceptable clean rejections. Silent success or undefined is
    // a bug.

    let threw = false;
    let envelope;

    try {
      envelope = await client.callTool({
        name: 'execute_momot_job',
        arguments: {}
      });
    } catch (err) {
      threw = true;
    }

    if (!threw) {
      assert.ok(
        envelope && envelope.isError === true,
        `Expected isError envelope when callTool did not throw; got: ${JSON.stringify(envelope).slice(0, 300)}`
      );
    }
    // If it threw, Zod validation rejected the call at the SDK boundary.
    // That is the preferred outcome and we accept it implicitly here.
  });
}
