import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new McpServer({ name: 'momot-mcp', version: '1.0.0' });

server.tool(
  'momot_generate',
  {
    prompt: z.string().optional(),
    packageName: z.string().optional(),
    className: z.string().optional(),
    modelPath: z.string(),
    henshinModules: z.array(z.string()).default([])
  },
  async ({ prompt, packageName, className, modelPath, henshinModules }) => {
    const scaffold = buildMomotScaffold({ prompt, packageName, className, modelPath, henshinModules });
    return {
      content: [{ type: 'text', text: scaffold }]
    };
  }
);

server.tool(
  'momot_validate',
  {
    scriptContent: z.string()
  },
  async ({ scriptContent }) => {
    const valid = scriptContent.trim().length > 0;
    return {
      content: [{ type: 'text', text: JSON.stringify({ valid }, null, 2) }]
    };
  }
);

server.tool(
  'momot_run',
  {
    scriptPath: z.string().optional().default('job.momot'),
    scriptContent: z.string(),
    filesBase64: z.record(z.string()).default({}),
    dockerImage: z.string().optional(),
    workdir: z.string().optional().default('/work'),
    outdir: z.string().optional().default('/out')
  },
  async ({ scriptPath, scriptContent, filesBase64, dockerImage, workdir, outdir }) => {
    const image = dockerImage || process.env.MOMOT_DOCKER_IMAGE || 'momot-runner:latest';
    const jobDir = fs.mkdtempSync(path.join(os.tmpdir(), 'momot-mcp-'));
    const workHost = path.join(jobDir, 'work');
    const outHost = path.join(jobDir, 'out');
    fs.mkdirSync(workHost, { recursive: true });
    fs.mkdirSync(outHost, { recursive: true });

    try {
      const safeScriptPath = writeJobFile(workHost, scriptPath, scriptContent, false);
      for (const [relativePath, encodedContent] of Object.entries(filesBase64)) {
        writeJobFile(workHost, relativePath, Buffer.from(encodedContent, 'base64'), true);
      }

      const args = [
        'run',
        '--rm',
        '-v', `${workHost}:${workdir}`,
        '-v', `${outHost}:${outdir}`,
        image,
        '--script', `${workdir}/${safeScriptPath}`,
        '--workdir', workdir,
        '--out', outdir
      ];

      const result = spawnSync('docker', args, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
      const outputJson = readJsonIfPresent(path.join(outHost, 'result.json'));
      const response = {
        exitCode: typeof result.status === 'number' ? result.status : -1,
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        resultJson: outputJson
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
      };
    } finally {
      fs.rmSync(jobDir, { recursive: true, force: true });
    }
  }
);

await server.connect(new StdioServerTransport());

function buildMomotScaffold({ prompt, packageName, className, modelPath, henshinModules }) {
  const lines = [];
  if (prompt && prompt.trim().length > 0) {
    lines.push(`// ${prompt.trim()}`);
    lines.push('');
  }
  if (className && className.trim().length > 0) {
    lines.push(`// scaffold for ${className.trim()}`);
    lines.push('');
  }
  lines.push(`package ${packageName && packageName.trim().length > 0 ? packageName.trim() : 'momot.search'}`);
  lines.push('');
  lines.push('import at.ac.tuwien.big.momot.search.fitness.dimension.TransformationLengthDimension');
  lines.push('import at.ac.tuwien.big.moea.experiment.executor.listener.SeedRuntimePrintListener');
  lines.push('');
  lines.push('initialization = {');
  lines.push('\tSystem.out.println("Search started.");');
  lines.push('}');
  lines.push('');
  lines.push('search = {');
  lines.push('\tmodel = {');
  lines.push(`\t\tfile = "${modelPath}"`);
  lines.push('\t}');
  lines.push('\tsolutionLength = 10');
  lines.push('');
  lines.push('\ttransformations = {');
  lines.push(`\t\tmodules = [ ${henshinModules.map((modulePath) => `"${modulePath}"`).join(', ')} ]`);
  lines.push('\t}');
  lines.push('');
  lines.push('\tfitness = {');
  lines.push('\t\tobjectives = {');
  lines.push('\t\t\tFirstObjective : minimize { 0.0 }');
  lines.push('\t\t\tSolutionLength : minimize new TransformationLengthDimension');
  lines.push('\t\t}');
  lines.push('\t}');
  lines.push('');
  lines.push('\talgorithms = {');
  lines.push('\t\tRandom : moea.createRandomSearch()');
  lines.push('\t}');
  lines.push('}');
  lines.push('');
  lines.push('experiment = {');
  lines.push('\tpopulationSize = 100');
  lines.push('\tmaxEvaluations = 10000');
  lines.push('\tnrRuns = 1');
  lines.push('\tprogressListeners = [ new SeedRuntimePrintListener ]');
  lines.push('}');
  lines.push('');
  lines.push('analysis = {');
  lines.push('\tindicators = [ hypervolume generationalDistance ]');
  lines.push('\tsignificance = 0.01');
  lines.push('\tshow = [ aggregateValues statisticalSignificance individualValues ]');
  lines.push('\toutputFile = "out/analysis.txt"');
  lines.push('\tboxplotDirectory = "out/analysis/"');
  lines.push('\tprintOutput');
  lines.push('}');
  lines.push('');
  lines.push('results = {');
  lines.push('\tobjectives = {');
  lines.push('\t\toutputFile = "out/objectives.txt"');
  lines.push('\t\tprintOutput');
  lines.push('\t}');
  lines.push('\tmodels = {');
  lines.push('\t\toutputDirectory = "out/models/"');
  lines.push('\t}');
  lines.push('}');
  lines.push('');
  lines.push('finalization = {');
  lines.push('\tSystem.out.println("Search finished.");');
  lines.push('}');
  return lines.join('\n');
}

function writeJobFile(workHost, relativePath, contents, binary) {
  const resolved = resolveInside(workHost, relativePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  if (binary) {
    fs.writeFileSync(resolved, contents);
  } else {
    fs.writeFileSync(resolved, contents, 'utf8');
  }
  return path.relative(workHost, resolved).replace(/\\/g, '/');
}

function resolveInside(rootDir, relativePath) {
  const resolved = path.resolve(rootDir, relativePath);
  const normalizedRoot = path.resolve(rootDir) + path.sep;
  if (!resolved.startsWith(normalizedRoot)) {
    throw new Error(`Path escapes job directory: ${relativePath}`);
  }
  return resolved;
}

function readJsonIfPresent(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
