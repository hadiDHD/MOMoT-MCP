import test from 'node:test';
import assert from 'node:assert/strict';
import { ArtifactStateMachine, checkForVagueInput } from '../lib/hitlHandler.js';

test('ArtifactStateMachine - Normal Approved Lifecycle', () => {
  const fsm = new ArtifactStateMachine('xmi');
  
  assert.equal(fsm.state, 'ABSENT');
  
  // detector says generate
  fsm.transition('DETECTOR_SAYS_GENERATE');
  assert.equal(fsm.state, 'GENERATING');
  
  // file written
  fsm.transition('SUB_AGENT_WRITES_FILE');
  assert.equal(fsm.state, 'GENERATED');
  assert.equal(fsm.attempts, 1);
  
  // validation passes
  fsm.transition('VALIDATOR_PASS_ALL_TIERS');
  assert.equal(fsm.state, 'VALIDATED');
  
  // user approves gate
  fsm.transition('HITL_GATE_APPROVED');
  assert.equal(fsm.state, 'APPROVED');
});

test('ArtifactStateMachine - Auto-Repair Flow (Success on 2nd attempt)', () => {
  const fsm = new ArtifactStateMachine('ecore');
  
  fsm.transition('DETECTOR_SAYS_GENERATE');
  fsm.transition('SUB_AGENT_WRITES_FILE'); // 1st try
  
  // fails validation
  fsm.transition('VALIDATOR_FAIL', { errors: ['Syntax error'] });
  assert.equal(fsm.state, 'REPAIR');
  assert.deepEqual(fsm.errors, ['Syntax error']);
  
  // subagent writes repaired file
  fsm.transition('SUB_AGENT_WRITES_FILE'); // 2nd try
  assert.equal(fsm.state, 'GENERATED');
  assert.equal(fsm.attempts, 2);
  
  // validation passes
  fsm.transition('VALIDATOR_PASS_ALL_TIERS');
  assert.equal(fsm.state, 'VALIDATED');
  
  fsm.transition('HITL_GATE_APPROVED');
  assert.equal(fsm.state, 'APPROVED');
});

test('ArtifactStateMachine - Three-Strike Escalation Flow', () => {
  const fsm = new ArtifactStateMachine('henshin');
  
  fsm.transition('DETECTOR_SAYS_GENERATE');
  
  // Strike 1
  fsm.transition('SUB_AGENT_WRITES_FILE'); // attempt 1
  fsm.transition('VALIDATOR_FAIL', { errors: ['Strike 1 error'] });
  assert.equal(fsm.state, 'REPAIR');
  
  // Strike 2
  fsm.transition('SUB_AGENT_WRITES_FILE'); // attempt 2
  fsm.transition('VALIDATOR_FAIL', { errors: ['Strike 2 error'] });
  assert.equal(fsm.state, 'REPAIR');
  
  // Strike 3
  fsm.transition('SUB_AGENT_WRITES_FILE'); // attempt 3
  fsm.transition('VALIDATOR_FAIL', { errors: ['Strike 3 error'] });
  
  // Should escalate to user after 3 failures
  assert.equal(fsm.state, 'ESCALATED');
  assert.deepEqual(fsm.errors, ['Strike 3 error']);
  
  // User provides manual guidance, resetting the attempts
  fsm.transition('USER_PROVIDES_GUIDANCE', { feedback: 'use the correct namespace URI' });
  assert.equal(fsm.state, 'GENERATING');
  assert.equal(fsm.attempts, 0);
  assert.equal(fsm.feedback, 'use the correct namespace URI');
});

test('checkForVagueInput - Detects vague prompts accurately', () => {
  const vaguePrompt = 'Optimize stack load balancing on 3 stacks';
  const explicitPrompt = 'Optimize stack load balancing. Stacks (3): stack0 initially has 5 items, others are empty.';
  const unrelatedPrompt = 'Just run a clean build';
  
  const v1 = checkForVagueInput(vaguePrompt, 'xmi');
  assert.equal(v1.isVague, true);
  assert.ok(v1.message.includes('vague regarding the initial model configuration'));
  
  const v2 = checkForVagueInput(explicitPrompt, 'xmi');
  assert.equal(v2.isVague, false);
  
  const v3 = checkForVagueInput(unrelatedPrompt, 'xmi');
  assert.equal(v3.isVague, false);
});
