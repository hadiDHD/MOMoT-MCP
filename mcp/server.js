import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { executeMomotJob, buildKnownGoodStackFixture, validateHenshin, validateMomot, detectArtifacts, generateEcore, generateXmi, generateHenshin, generateMomot, validateEcore, validateXmi, validateJavaHelper, generateJavaHelper } from './lib.js';

const server = new McpServer({ name: 'momot-mcp', version: '1.1.0' });

const executeSchema = {
  restBaseUrl: z.string().optional(),
  scriptPath: z.string(),
  filesBase64: z.record(z.string()),
  requestTimeoutMs: z.number().int().positive().optional(),
  retries: z.number().int().nonnegative().optional(),
  retryDelayMs: z.number().int().nonnegative().optional(),
  logTailLines: z.number().int().positive().optional()
};

server.tool('execute_momot_job', executeSchema, async (input) => {
  const result = await executeMomotJob(input);
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});

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

server.tool(
  'generate_henshin',
  {
    ecorePath: z.string().optional().describe('Path to the .ecore metamodel file'),
    ecoreContent: z.string().optional().describe('Inline Ecore content'),
    nlDescription: z.string().optional().describe('Natural language description'),
    outputPath: z.string().optional().describe('Output path for .henshin file'),
    validate: z.boolean().optional().default(true).describe('Validate generated Henshin rule file')
  },
  async (input) => {
    const result = await generateHenshin(input);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'generate_momot',
  {
    ecorePath: z.string().optional().describe('Path to the .ecore metamodel file'),
    ecoreContent: z.string().optional().describe('Inline Ecore content'),
    modelPath: z.string().describe('Path to the XMI model instance file'),
    henshinPath: z.string().describe('Path to the .henshin rules file'),
    objectiveHints: z.array(z.string()).optional().default([]).describe('Objective hints'),
    packageName: z.string().optional().describe('Java package name'),
    className: z.string().optional().describe('Java class name'),
    outputPath: z.string().optional().describe('Output path for the .momot file'),
    validate: z.boolean().optional().default(true).describe('Validate generated MOMoT file')
  },
  async (input) => {
    const result = await generateMomot(input);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'validate_java_helper',
  {
    javaPath: z.string().optional().describe('Path to the .java helper file to validate'),
    javaContent: z.string().optional().describe('Inline Java helper class content')
  },
  async (input) => {
    const result = await validateJavaHelper(input);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

await server.connect(new StdioServerTransport());
