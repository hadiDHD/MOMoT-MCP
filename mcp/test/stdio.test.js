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

// Tools that are part of the validated functional subset (v2.0.0-alpha.1).
// The server also exposes 3 backward-compatible alias tools (momot_generate,
// momot_validate, momot_run) that are PoC / unvalidated and not asserted
// here; see mcp/README.md for the full surface. This test informs about
// their presence via console.log but does not fail when they appear.
const VALIDATED_TOOLS = [
  'generate_artifacts_from_ecore',
  'execute_momot_job',
  'run_end_to_end'
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
  // Test 3: generate_artifacts_from_ecore (no REST needed)

  test('generate_artifacts_from_ecore with minimal ecore returns success envelope', async () => {
    const result = await client.callTool({
      name: 'generate_artifacts_from_ecore',
      arguments: {
        ecoreContent: MIN_ECORE,
        modelContent: '<root/>',
        packageName: 'demo.search',
        className: 'StdioTestSearch'
      }
    });

    assert.ok(result.content, 'Envelope should have content array');
    assert.equal(result.content[0]?.type, 'text', 'First content item should be of type text');

    let payload;
    try {
      payload = JSON.parse(result.content[0].text);
    } catch (err) {
      assert.fail(`Content text should be valid JSON, got: ${String(result.content[0].text).slice(0, 200)}`);
    }

    assert.equal(
      payload.success,
      true,
      `Generation failed: ${payload.summary || JSON.stringify(payload).slice(0, 300)}`
    );
    assert.ok(
      typeof payload.scriptPath === 'string' && payload.scriptPath.includes('.momot'),
      `scriptPath should reference a .momot file, got: ${payload.scriptPath}`
    );
    assert.ok(payload.generatedFiles, 'Envelope should include generatedFiles');
    assert.ok(
      Object.keys(payload.generatedFiles).length > 0,
      'generatedFiles should not be empty'
    );
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

  // -------------------------------------------------------------------------
  // Test 5: run_end_to_end with known-good fixture (requires REST)

  test(
    'run_end_to_end with knownGoodFixture=true succeeds end-to-end',
    { timeout: 240000 },
    async (t) => {
      if (!process.env.MOMOT_REST_BASE_URL) {
        t.skip('MOMOT_REST_BASE_URL not set, skipping REST-dependent test');
        return;
      }

      const result = await client.callTool({
        name: 'run_end_to_end',
        arguments: { knownGoodFixture: true }
      });

      assert.ok(result.content, 'Envelope should have content array');
      assert.equal(result.content[0]?.type, 'text');

      const payload = JSON.parse(result.content[0].text);
      assert.equal(
        payload.success,
        true,
        `run_end_to_end failed: summary=${payload.summary || '(none)'}; logTail=${String(payload.logTail || '').slice(0, 500)}`
      );
      assert.equal(
        payload.exitCode,
        0,
        `exitCode should be 0, got ${payload.exitCode}`
      );
      assert.ok(
        Array.isArray(payload.outputs),
        'Envelope should include outputs array (may be empty)'
      );
    }
  );
}
