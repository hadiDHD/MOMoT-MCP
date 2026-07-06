import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { executeMomotJob, generateArtifactsFromEcore, runEndToEnd, buildKnownGoodStackFixture, validateHenshin, validateMomot, detectArtifacts, generateEcore, generateXmi, validateEcore, validateXmi, generateJavaHelper } from './lib.js';

const server = new McpServer({ name: 'momot-mcp', version: '1.1.0' });

const generationSchema = {
  ecoreContent: z.string().optional(),
  ecorePath: z.string().optional(),
  modelContent: z.string().optional(),
  modelPath: z.string().optional(),
  problemDescription: z.string().optional(),
  objectiveHints: z.array(z.string()).default([]),
  packageName: z.string().optional(),
  className: z.string().optional(),
  scriptPath: z.string().optional(),
  henshinPath: z.string().optional(),
  ecorePathInZip: z.string().optional(),
  modelPathInZip: z.string().optional(),
  includeJavaHelper: z.boolean().default(false),
  helperPathInZip: z.string().optional(),
  allowMissingModelForGeneration: z.boolean().default(false)
};

const executeSchema = {
  restBaseUrl: z.string().optional(),
  scriptPath: z.string(),
  filesBase64: z.record(z.string()),
  requestTimeoutMs: z.number().int().positive().optional(),
  retries: z.number().int().nonnegative().optional(),
  retryDelayMs: z.number().int().nonnegative().optional(),
  logTailLines: z.number().int().positive().optional()
};

server.tool('generate_artifacts_from_ecore', generationSchema, async (input) => {
  if (!input.ecoreContent && !input.ecorePath) {
    throw new Error('Provide either ecoreContent or ecorePath.');
  }
  const result = await generateArtifactsFromEcore(input);
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});

server.tool('execute_momot_job', executeSchema, async (input) => {
  const result = await executeMomotJob(input);
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});

server.tool(
  'run_end_to_end',
  {
    ...generationSchema,
    restBaseUrl: z.string().optional(),
    requestTimeoutMs: z.number().int().positive().optional(),
    retries: z.number().int().nonnegative().optional(),
    retryDelayMs: z.number().int().nonnegative().optional(),
    logTailLines: z.number().int().positive().optional(),
    knownGoodFixture: z.boolean().default(false)
  },
  async (input) => {
    let result;
    if (input.knownGoodFixture) {
      const fixture = await buildKnownGoodStackFixture();
      result = await executeMomotJob({
        restBaseUrl: input.restBaseUrl,
        scriptPath: fixture.scriptPath,
        filesBase64: fixture.filesBase64,
        requestTimeoutMs: input.requestTimeoutMs,
        retries: input.retries,
        retryDelayMs: input.retryDelayMs,
        logTailLines: input.logTailLines
      });
    } else {
      if (!input.ecoreContent && !input.ecorePath) {
        throw new Error('Provide either ecoreContent or ecorePath, or set knownGoodFixture=true.');
      }
      result = await runEndToEnd(input);
    }

    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'validate_henshin',
  {
    henshinPath: z.string().describe('Path to the .henshin file (absolute or CWD-relative).'),
    mode: z.enum(['structure', 'semantic', 'apply']).default('structure').describe(
      '"structure": XMI parse only, no metamodel needed. ' +
      '"semantic": resolve type refs against metamodel. ' +
      '"apply": execute a rule against a model instance.'
    ),
    metamodelPath: z.string().optional().describe('Path to the .ecore file (required for semantic and apply modes).'),
    modelPath: z.string().optional().describe('Path to the .xmi model instance (required for apply mode).'),
    ruleName: z.string().optional().describe('Name of the rule to apply (required for apply mode).'),
    parameters: z.record(z.string()).default({}).describe('Rule parameter values as a string map, e.g. { "amount": "3" }.')
  },
  async (input) => {
    const result = await validateHenshin(input);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'validate_momot',
  {
    momotPath: z.string().describe('Path to the .momot file (absolute or CWD-relative).'),
    mode: z.enum(['structure', 'semantic', 'compile']).default('structure').describe(
      '"structure": parse the script only. ' +
      '"semantic": full Xtext validation including file paths and OCL. ' +
      '"compile": generate Java and compile with javac.'
    ),
    projectRoot: z.string().optional().describe(
      'Job root directory for resolving relative paths in the script (e.g. model/stack.henshin). ' +
      'Required for semantic and compile when paths are project-relative.'
    )
  },
  async (input) => {
    const result = await validateMomot(input);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'detect_artifacts',
  {
    workspaceDir: z.string().describe('Absolute or relative workspace path to scan'),
    userPrompt: z.string().describe('Natural-language problem description'),
    dryRun: z.boolean().optional().default(false)
  },
  async (input) => {
    const result = await detectArtifacts(input);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'generate_ecore',
  {
    nlDescription: z.string().describe('Natural-language description of the problem domain'),
    packageName: z.string().optional().describe('Java package name'),
    nsURI: z.string().optional().describe('EPackage nsURI'),
    outputPath: z.string().optional().describe('Output Ecore file path'),
    validate: z.boolean().optional().default(true)
  },
  async (input) => {
    const result = await generateEcore(input);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'generate_xmi',
  {
    ecorePath: z.string().describe('Path to the .ecore metamodel file'),
    nlDescription: z.string().optional().describe('Optional scenario details'),
    instanceSize: z.number().int().positive().optional().default(5),
    badStartPolicy: z.enum(['worst-case', 'random', 'balanced']).optional().default('worst-case'),
    outputPath: z.string().optional().describe('Output XMI file path'),
    validate: z.boolean().optional().default(true)
  },
  async (input) => {
    const result = await generateXmi(input);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'validate_ecore',
  {
    ecorePath: z.string().describe('Path to the .ecore file'),
    mode: z.enum(['structure', 'semantic']).default('structure').describe('Validation mode')
  },
  async (input) => {
    const result = await validateEcore(input);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'validate_xmi',
  {
    xmiPath: z.string().describe('Path to the .xmi instance file'),
    mode: z.enum(['structure', 'semantic', 'load']).default('structure').describe('Validation mode'),
    ecorePath: z.string().optional().describe('Path to Ecore metamodel (required for semantic/load)')
  },
  async (input) => {
    const result = await validateXmi(input);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'generate_java_helper',
  {
    ecorePath: z.string().describe('Path to the .ecore file'),
    objectiveDescription: z.string().describe('Objective definition description'),
    packageName: z.string().describe('FQN Java package'),
    className: z.string().optional().describe('Class name for generated Java file'),
    template: z.enum(['graph-metric', 'external-data', 'cached']).optional().default('graph-metric'),
    outputPath: z.string().optional().describe('Output Java file path')
  },
  async (input) => {
    const result = await generateJavaHelper(input);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

await server.connect(new StdioServerTransport());
