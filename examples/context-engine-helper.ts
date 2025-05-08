/**
 * Helper functions for examining and debugging the context engine
 * 
 * These functions allow you to inspect the internal state of the context engine,
 * including test runs, steps, and summaries.
 */

import { ContextEngine, TestRunContext, TestStepContext } from '@acabai/core';
import { PuppeteerAgent } from '@acabai/web';

/**
 * Get the current context data from a PuppeteerAgent
 * 
 * @param agent The PuppeteerAgent instance
 * @returns The context data or null if context engine is not enabled
 */
export function getContextData(agent: PuppeteerAgent): {
  currentRun: TestRunContext | null;
  history: TestRunContext[];
} | null {
  // Access the context engine from the agent
  // Note: This uses internal properties that might not be publicly exposed
  const contextEngine = (agent as any).contextEngine as ContextEngine | undefined;
  
  if (!contextEngine) {
    console.error('Context engine not found or not enabled on this agent');
    return null;
  }
  
  return {
    currentRun: contextEngine.getCurrentTestRun(),
    history: contextEngine.getTestRunHistory()
  };
}

/**
 * Print a formatted representation of the context data
 * 
 * @param agent The PuppeteerAgent instance
 * @param options Options for controlling the output
 */
export function printContextData(
  agent: PuppeteerAgent, 
  options: {
    includeMetadata?: boolean;
    includeTimestamps?: boolean;
    colorize?: boolean;
  } = {}
): void {
  const contextData = getContextData(agent);
  
  if (!contextData) {
    console.error('No context data available');
    return;
  }
  
  const { currentRun, history } = contextData;
  const { includeMetadata = false, includeTimestamps = false, colorize = true } = options;
  
  // Helper for colorizing output if enabled
  const c = {
    reset: colorize ? '\x1b[0m' : '',
    bright: colorize ? '\x1b[1m' : '',
    dim: colorize ? '\x1b[2m' : '',
    red: colorize ? '\x1b[31m' : '',
    green: colorize ? '\x1b[32m' : '',
    yellow: colorize ? '\x1b[33m' : '',
    blue: colorize ? '\x1b[34m' : '',
    magenta: colorize ? '\x1b[35m' : '',
    cyan: colorize ? '\x1b[36m' : '',
  };
  
  console.log(`${c.bright}=== Context Engine Data ===${c.reset}\n`);
  
  // Print current run if available
  if (currentRun) {
    console.log(`${c.bright}Current Test Run:${c.reset} ${currentRun.name}`);
    if (currentRun.description) {
      console.log(`${c.dim}Description:${c.reset} ${currentRun.description}`);
    }
    console.log(`${c.dim}Status:${c.reset} ${getStatusColor(currentRun.result, c)}`);
    if (includeTimestamps) {
      console.log(`${c.dim}Started:${c.reset} ${new Date(currentRun.timestamp).toLocaleString()}`);
      if (currentRun.completedTimestamp) {
        console.log(`${c.dim}Completed:${c.reset} ${new Date(currentRun.completedTimestamp).toLocaleString()}`);
      }
    }
    if (currentRun.summary) {
      console.log(`${c.dim}Summary:${c.reset} ${currentRun.summary}`);
    }
    
    // Print steps
    if (currentRun.steps.length > 0) {
      console.log(`\n${c.bright}Steps:${c.reset}`);
      currentRun.steps.forEach((step, index) => {
        printStep(step, index + 1, c, { includeMetadata, includeTimestamps });
      });
    } else {
      console.log(`\n${c.dim}No steps recorded yet${c.reset}`);
    }
  } else {
    console.log(`${c.dim}No active test run${c.reset}`);
  }
  
  // Print history if available
  if (history.length > 0) {
    console.log(`\n${c.bright}Test Run History:${c.reset}`);
    history.forEach((run, index) => {
      console.log(`\n${c.bright}Run #${index + 1}:${c.reset} ${run.name}`);
      if (run.description) {
        console.log(`${c.dim}Description:${c.reset} ${run.description}`);
      }
      console.log(`${c.dim}Status:${c.reset} ${getStatusColor(run.result, c)}`);
      if (includeTimestamps) {
        console.log(`${c.dim}Started:${c.reset} ${new Date(run.timestamp).toLocaleString()}`);
        if (run.completedTimestamp) {
          console.log(`${c.dim}Completed:${c.reset} ${new Date(run.completedTimestamp).toLocaleString()}`);
        }
      }
      if (run.summary) {
        console.log(`${c.dim}Summary:${c.reset} ${run.summary}`);
      }
      
      // Print steps
      if (run.steps.length > 0) {
        console.log(`\n${c.bright}Steps:${c.reset}`);
        run.steps.forEach((step, stepIndex) => {
          printStep(step, stepIndex + 1, c, { includeMetadata, includeTimestamps });
        });
      } else {
        console.log(`\n${c.dim}No steps recorded${c.reset}`);
      }
    });
  } else {
    console.log(`\n${c.dim}No test run history${c.reset}`);
  }
}

/**
 * Get the raw context data as JSON
 * 
 * @param agent The PuppeteerAgent instance
 * @returns The context data as a JSON string or null if context engine is not enabled
 */
export function getContextDataAsJson(agent: PuppeteerAgent): string | null {
  const contextData = getContextData(agent);
  
  if (!contextData) {
    return null;
  }
  
  return JSON.stringify(contextData, null, 2);
}

/**
 * Extract all summaries from the context
 * 
 * @param agent The PuppeteerAgent instance
 * @returns An object containing step summaries and run summaries
 */
export function extractSummaries(agent: PuppeteerAgent): {
  stepSummaries: { step: string; summary: string }[];
  runSummaries: { run: string; summary: string }[];
} {
  const contextData = getContextData(agent);
  const result = {
    stepSummaries: [] as { step: string; summary: string }[],
    runSummaries: [] as { run: string; summary: string }[]
  };
  
  if (!contextData) {
    return result;
  }
  
  // Extract from current run
  if (contextData.currentRun) {
    if (contextData.currentRun.summary) {
      result.runSummaries.push({
        run: contextData.currentRun.name,
        summary: contextData.currentRun.summary
      });
    }
    
    // Extract from steps
    contextData.currentRun.steps.forEach(step => {
      if (step.summary) {
        result.stepSummaries.push({
          step: `${step.action}: ${step.description}`,
          summary: step.summary
        });
      }
    });
  }
  
  // Extract from history
  contextData.history.forEach(run => {
    if (run.summary) {
      result.runSummaries.push({
        run: run.name,
        summary: run.summary
      });
    }
    
    // Extract from steps
    run.steps.forEach(step => {
      if (step.summary) {
        result.stepSummaries.push({
          step: `${step.action}: ${step.description}`,
          summary: step.summary
        });
      }
    });
  });
  
  return result;
}

/**
 * Get the context that would be sent to the AI model
 * 
 * @param agent The PuppeteerAgent instance
 * @returns The formatted context string that would be sent to the AI
 */
export function getAiContext(agent: PuppeteerAgent): string | null {
  // Access the action context integrator from the agent
  // Note: This uses internal properties that might not be publicly exposed
  const actionContextIntegrator = (agent as any).actionContextIntegrator;
  
  if (!actionContextIntegrator) {
    console.error('Action context integrator not found or not enabled on this agent');
    return null;
  }
  
  // Get the base AI action context
  const baseContext = (agent as any).opts?.aiActionContext || '';
  
  // Get the action summaries
  const actionSummaries = actionContextIntegrator.getActionSummaries();
  
  // Combine them as they would be combined in the aiAction method
  return `${baseContext}\n\n${actionSummaries}`;
}

// Helper function to print a step
function printStep(
  step: TestStepContext, 
  index: number, 
  c: Record<string, string>,
  options: { includeMetadata?: boolean; includeTimestamps?: boolean }
): void {
  const { includeMetadata = false, includeTimestamps = false } = options;
  
  console.log(`${c.bright}Step ${index}:${c.reset} ${step.action}`);
  console.log(`${c.dim}Description:${c.reset} ${step.description}`);
  console.log(`${c.dim}Status:${c.reset} ${getStatusColor(step.result, c)}`);
  
  if (step.error) {
    console.log(`${c.red}Error:${c.reset} ${step.error}`);
  }
  
  if (step.summary) {
    console.log(`${c.dim}Summary:${c.reset} ${step.summary}`);
  }
  
  if (includeTimestamps) {
    console.log(`${c.dim}Timestamp:${c.reset} ${new Date(step.timestamp).toLocaleString()}`);
  }
  
  if (includeMetadata && step.metadata) {
    console.log(`${c.dim}Metadata:${c.reset}`);
    console.log(JSON.stringify(step.metadata, null, 2));
  }
  
  console.log(''); // Empty line for spacing
}

// Helper function to get colored status text
function getStatusColor(status: string, c: Record<string, string>): string {
  switch (status) {
    case 'success':
      return `${c.green}${status}${c.reset}`;
    case 'failure':
      return `${c.red}${status}${c.reset}`;
    case 'pending':
      return `${c.yellow}${status}${c.reset}`;
    default:
      return status;
  }
}
