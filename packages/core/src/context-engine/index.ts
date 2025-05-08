import { v4 as uuidv4 } from 'uuid';
import { generateStepSummary, generateTestRunSummary } from './ai-summarizer';
import { ActionContextIntegrator } from './context-integration';
import type {
  ContextEngineOptions,
  CreateTestRunOptions,
  CreateTestStepOptions,
  TestRunContext,
  TestStepContext,
  TestStepStatus
} from './types';

/**
 * Context Engine for storing and managing test steps and runs
 */
export class ContextEngine {
  /**
   * Maximum number of steps to keep in the context
   */
  private maxSteps: number;

  /**
   * Whether to use AI for generating summaries
   */
  private useAiSummaries: boolean;

  /**
   * The current test run
   */
  private currentTestRun: TestRunContext | null = null;

  /**
   * History of completed test runs
   */
  private testRunHistory: TestRunContext[] = [];

  /**
   * Create a new context engine
   */
  constructor(options: ContextEngineOptions = {}) {
    this.maxSteps = options.maxSteps || 10;
    this.useAiSummaries = options.useAiSummaries !== false;
  }

  /**
   * Start a new test run
   */
  async startTestRun(options: CreateTestRunOptions): Promise<TestRunContext> {
    // Complete any existing test run
    if (this.currentTestRun) {
      await this.completeTestRun();
    }

    // Create a new test run
    this.currentTestRun = {
      id: uuidv4(),
      name: options.name,
      description: options.description,
      steps: [],
      result: 'pending',
      timestamp: Date.now()
    };

    return this.currentTestRun;
  }

  /**
   * Complete the current test run
   */
  async completeTestRun(): Promise<TestRunContext | null> {
    if (!this.currentTestRun) {
      return null;
    }

    // Determine the result of the test run
    const hasFailures = this.currentTestRun.steps.some(step => step.result === 'failure');
    this.currentTestRun.result = hasFailures ? 'failure' : 'success';
    this.currentTestRun.completedTimestamp = Date.now();

    // Generate a summary for the test run
    if (this.useAiSummaries) {
      this.currentTestRun.summary = await generateTestRunSummary(this.currentTestRun);
    }

    // Add the test run to the history
    this.testRunHistory.push(this.currentTestRun);

    // Clear the current test run
    const completedRun = this.currentTestRun;
    this.currentTestRun = null;

    return completedRun;
  }

  /**
   * Add a step to the current test run
   */
  async addStep(options: CreateTestStepOptions): Promise<TestStepContext> {
    if (!this.currentTestRun) {
      throw new Error('No active test run. Call startTestRun first.');
    }

    // Create a new step
    const step: TestStepContext = {
      id: uuidv4(),
      action: options.action,
      description: options.description,
      result: 'pending',
      metadata: options.metadata,
      timestamp: Date.now()
    };

    // Add the step to the current test run
    this.currentTestRun.steps.push(step);

    // Limit the number of steps if needed
    if (this.currentTestRun.steps.length > this.maxSteps) {
      this.currentTestRun.steps.shift();
    }

    return step;
  }

  /**
   * Complete a step in the current test run
   *
   * @param stepId The ID of the step to complete
   * @param result The result status of the step
   * @param error Optional error message if the step failed
   * @param actionResult Optional result data from the action
   * @returns The updated step or null if not found
   */
  async completeStep(
    stepId: string,
    result: TestStepStatus,
    error?: string,
    actionResult?: any
  ): Promise<TestStepContext | null> {
    if (!this.currentTestRun) {
      return null;
    }

    // Find the step
    const step = this.currentTestRun.steps.find(s => s.id === stepId);
    if (!step) {
      return null;
    }

    // Update the step
    step.result = result;
    if (error) {
      step.error = error;
    }
    if (actionResult !== undefined) {
      step.actionResult = actionResult;
    }

    // Generate a summary for the step
    if (this.useAiSummaries) {
      step.summary = await generateStepSummary(step);
    }

    return step;
  }

  /**
   * Get all completed steps from the current test run
   */
  getCompletedSteps(): TestStepContext[] {
    if (!this.currentTestRun) {
      return [];
    }

    // Get the completed steps
    return this.currentTestRun.steps.filter(
      step => step.result === 'success' || step.result === 'failure'
    );
  }

  /**
   * Get summaries of all completed actions
   *
   * @returns A formatted string with summaries of all completed actions
   */
  getActionSummaries(): string {
    const completedSteps = this.getCompletedSteps();

    if (!completedSteps.length) {
      return '';
    }

    const summariesText = completedSteps
      .map((step, index) => {
        const stepNumber = index + 1;
        const summary = step.summary || `${step.action}: ${step.description} (${step.result})`;
        return `${stepNumber}. ${summary}`;
      })
      .join('\n');

    return `
### Previous Actions Summary
The following actions have already been performed:

${summariesText}
`;
  }

  /**
   * Get the current test run
   */
  getCurrentTestRun(): TestRunContext | null {
    return this.currentTestRun;
  }

  /**
   * Get the test run history
   */
  getTestRunHistory(): TestRunContext[] {
    return [...this.testRunHistory];
  }

  /**
   * Clear all test runs and history
   */
  clear(): void {
    this.currentTestRun = null;
    this.testRunHistory = [];
  }
}

// Export the ActionContextIntegrator
export { ActionContextIntegrator };

// Export types
export type {
  ContextEngineOptions,
  CreateTestRunOptions,
  CreateTestStepOptions,
  TestRunContext,
  TestStepContext,
  TestStepStatus
} from './types';

// Export AI summarizer functions
export {
  generateStepSummary,
  generateTestRunSummary
} from './ai-summarizer';
