import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {
  buildJobZip,
  normalizeZipPath,
  parseResponseZip,
  detectArtifacts,
  generateEcore,
  generateXmi,
  generateHenshin,
  generateMomot,
  validateEcore,
  validateXmi,
  validateJavaHelper,
  generateJavaHelper
} from '../lib.js';

test('normalizeZipPath rejects traversal and drive letters', () => {
  assert.equal(normalizeZipPath('src/a.momot'), 'src/a.momot');
  assert.throws(() => normalizeZipPath('../evil.txt'));
  assert.throws(() => normalizeZipPath('C:/evil.txt'));
});

test('buildJobZip uses Linux-compatible entry paths', async () => {
  const zipBuffer = await buildJobZip({
    'src\\demo\\Search.momot': Buffer.from('search = {}', 'utf8').toString('base64'),
    'model\\input\\model\\model.xmi': Buffer.from('<xmi/>', 'utf8').toString('base64')
  });

  const zip = await JSZip.loadAsync(zipBuffer);
  const entries = Object.keys(zip.files).filter((name) => !zip.files[name].dir).sort();
  assert.deepEqual(entries, ['model/input/model/model.xmi', 'src/demo/Search.momot']);
});

test('parseResponseZip extracts exit code, outputs, and log tail', async () => {
  const zip = new JSZip();
  zip.file('runner/exit_code.txt', '0');
  zip.file('runner/request.json', JSON.stringify({ script: 'src/demo/Search.momot' }));
  zip.file('runner/runner.log', 'line1\nline2\nline3');
  zip.file('out/models/result.xmi', '<xmi/>');

  const response = await parseResponseZip(await zip.generateAsync({ type: 'nodebuffer' }), 2);
  assert.equal(response.exitCode, 0);
  assert.equal(response.request.script, 'src/demo/Search.momot');
  assert.deepEqual(response.outputs, ['out/models/result.xmi']);
  assert.equal(response.logTail, 'line2\nline3');
});

test('detectArtifacts plans correctly on T01', async () => {
  const result = await detectArtifacts({
    workspaceDir: '../test-suite/T01-stack-balancing',
    userPrompt: 'optimize stack load balancing'
  });
  assert.equal(result.success, true);
  assert.ok(result.plan.length >= 3);
});

test('generateEcore and validateEcore workflow', async () => {
  const result = await generateEcore({
    nlDescription: 'A model containing stacks and elements',
    packageName: 'testpackage',
    outputPath: '../tools/ecore-validator/lib/test_generated.ecore',
    validate: false
  });
  assert.equal(result.success, true);
  assert.ok(result.ecoreContent.includes('StackModel'));

  const valResult = await validateEcore({
    ecorePath: '../tools/ecore-validator/lib/test_generated.ecore',
    mode: 'structure'
  });
  assert.equal(valResult.success, true);
});

test('generateXmi and validateXmi workflow', async () => {
  const result = await generateXmi({
    ecorePath: '../test-suite/T01-stack-balancing/model/stack.ecore',
    nlDescription: 'optimize stack load balancing',
    instanceSize: 5,
    outputPath: '../tools/xmi-validator/lib/test_generated.xmi',
    validate: false
  });
  assert.equal(result.success, true);
  assert.ok(result.xmiContent.includes('_el4'));

  const valResult = await validateXmi({
    xmiPath: '../tools/xmi-validator/lib/test_generated.xmi',
    mode: 'structure'
  });
  assert.equal(valResult.success, true);
});

test('generateJavaHelper produces compilable output structure', async () => {
  const result = await generateJavaHelper({
    ecorePath: '../test-suite/T01-stack-balancing/model/stack.ecore',
    objectiveDescription: 'Minimize makespan of scheduling',
    packageName: 'generated.search',
    className: 'SchedulingFitness',
    template: 'graph-metric',
    outputPath: '../mcp/test/SchedulingFitness.java'
  });
  assert.equal(result.success, true);
  assert.ok(result.javaContent.includes('public class SchedulingFitness'));
});

test('generateHenshin produces valid Henshin output', async () => {
  const result = await generateHenshin({
    ecorePath: '../test-suite/T01-stack-balancing/model/stack.ecore',
    outputPath: '../tools/henshin-validator/lib/test_generated.henshin',
    validate: true
  });
  assert.equal(result.success, true);
  assert.ok(result.henshinContent.includes('<henshin:Module'));
  assert.ok(result.henshinContent.includes('create_StackModel'));
});

test('generateMomot produces valid MOMoT output', async () => {
  const result = await generateMomot({
    ecorePath: '../test-suite/T01-stack-balancing/model/stack.ecore',
    modelPath: 'model/input/model/model_five_stacks.xmi',
    henshinPath: 'model/stack.henshin',
    objectiveHints: ['Minimize imbalance'],
    packageName: 'demo.search',
    className: 'GeneratedSearch',
    outputPath: '../tools/momot-validator/lib/test_generated.momot',
    validate: false
  });
  assert.equal(result.success, true);
  assert.ok(result.momotContent.includes('package demo.search'));
  assert.ok(result.momotContent.includes('modules = [ "model/stack.henshin" ]'));
});

test('validateJavaHelper structural conformance checks', async () => {
  const validJava = `package demo;
import at.ac.tuwien.big.momot.search.fitness.AbstractEGraphFitness;
import at.ac.tuwien.big.momot.problem.solution.TransformationSolution;
import org.eclipse.emf.henshin.interpreter.EGraph;

public class MyCustomFitness extends AbstractEGraphFitness {
    @Override
    public double[] evaluate(TransformationSolution solution) {
        return new double[]{ 0.0 };
    }
}
`;

  const invalidJava = `package demo;
public class MyCustomFitness {
    public void evaluate() {}
}
`;

  const resultValid = await validateJavaHelper({ javaContent: validJava });
  assert.equal(resultValid.success, true);
  assert.equal(resultValid.pass, true);

  const resultInvalid = await validateJavaHelper({ javaContent: invalidJava });
  assert.equal(resultInvalid.success, false);
  assert.equal(resultInvalid.pass, false);
  assert.ok(resultInvalid.errors.length > 0);
});
