/**
 * HITL Handler & State Machine for the MOMoT Smart Agent.
 * Conforms to scaffold/02-architecture/artifact-lifecycle.md and scaffold/05-hitl/README.md.
 */
export class ArtifactStateMachine {
  constructor(artifactType) {
    this.type = artifactType;
    this.state = 'ABSENT'; // Initial state
    this.attempts = 0;
    this.history = [];
    this.errors = [];
    this.feedback = null;
  }

  transition(event, payload = {}) {
    const prevState = this.state;
    
    switch (this.state) {
      case 'ABSENT':
        if (event === 'DETECTOR_SAYS_GENERATE') {
          this.state = 'GENERATING';
        } else if (event === 'DETECTOR_SAYS_VALIDATE') {
          this.state = 'GENERATED';
        }
        break;

      case 'GENERATING':
        if (event === 'SUB_AGENT_WRITES_FILE') {
          this.state = 'GENERATED';
          this.attempts++;
        } else if (event === 'SUB_AGENT_ERROR') {
          if (this.attempts >= 3) {
            this.state = 'ESCALATED';
          }
        }
        break;

      case 'GENERATED':
        if (event === 'VALIDATOR_PASS_ALL_TIERS') {
          this.state = 'VALIDATED';
          this.errors = [];
        } else if (event === 'VALIDATOR_FAIL') {
          this.errors = payload.errors || [];
          if (this.attempts < 3) {
            this.state = 'REPAIR';
          } else {
            this.state = 'ESCALATED';
          }
        }
        break;

      case 'VALIDATED':
        if (event === 'HITL_GATE_APPROVED') {
          this.state = 'APPROVED';
        } else if (event === 'HITL_GATE_REJECTED') {
          this.state = 'GENERATING';
          this.feedback = payload.feedback || '';
        }
        break;

      case 'REPAIR':
        if (event === 'SUB_AGENT_WRITES_FILE') {
          this.state = 'GENERATED';
          this.attempts++;
        }
        break;

      case 'ESCALATED':
        if (event === 'USER_PROVIDES_GUIDANCE') {
          this.state = 'GENERATING';
          this.attempts = 0; // Reset attempts after manual intervention
          this.feedback = payload.feedback || '';
        } else if (event === 'USER_ABANDONS') {
          this.state = 'CANCELLED';
        }
        break;

      case 'APPROVED':
        // Terminal success state for this artifact lifecycle
        break;

      default:
        break;
    }

    this.history.push({
      from: prevState,
      to: this.state,
      event,
      attempts: this.attempts,
      timestamp: Date.now()
    });

    return this.state;
  }
}
export function checkForVagueInput(userPrompt, artifactType) {
  if (artifactType === 'xmi' || artifactType === 'ecore') {
    const lcPrompt = (userPrompt || '').toLowerCase();
    
    // Check if the prompt has explicit initialization details (such as initially, starts with, or holds)
    const hasDomainKeywords = /stack|balancing|load|routing|vehicle|scheduling|machine/i.test(lcPrompt);
    const hasInitialQuantities = /initially|init|starts\s*with|holds|assigned|demand|capacity/i.test(lcPrompt);
    
    if (hasDomainKeywords && !hasInitialQuantities) {
      return {
        isVague: true,
        message: `Your description is vague regarding the initial model configuration. Please specify: 1) How many stacks/vehicles/containers? 2) Which stack/vehicle currently holds how many objects/tasks?`
      };
    }
  }
  return { isVague: false };
}
