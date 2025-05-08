import type { ContextEngine } from './index';

/**
 * Integrates the context engine with aiAction calls
 */
export class ActionContextIntegrator {
  /**
   * The context engine instance
   */
  private contextEngine: ContextEngine;

  /**
   * Create a new action context integrator
   */
  constructor(contextEngine: ContextEngine) {
    this.contextEngine = contextEngine;
  }

  /**
   * Record an action and its result
   *
   * @param action The action name (e.g., 'click', 'input', 'assert')
   * @param description Description of the action
   * @param metadata Additional metadata for the action
   * @returns The created step
   */
  async recordAction(
    action: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<{ stepId: string }> {
    const step = await this.contextEngine.addStep({
      action,
      description,
      metadata
    });

    return { stepId: step.id };
  }

  /**
   * Complete a recorded action with success or failure
   *
   * @param stepId The ID of the step to complete
   * @param success Whether the action was successful
   * @param error Error message if the action failed
   * @param actionResult The result data from the action
   */
  async completeAction(
    stepId: string,
    success: boolean,
    error?: string,
    actionResult?: any
  ): Promise<void> {
    await this.contextEngine.completeStep(
      stepId,
      success ? 'success' : 'failure',
      error,
      actionResult
    );
  }

  /**
   * Get summaries of all completed actions
   *
   * @returns A formatted string with summaries of all completed actions
   */
  getActionSummaries(): string {
    return this.contextEngine.getActionSummaries();
  }

  /**
   * Wrap an async function with action recording
   *
   * @param action The action name
   * @param description Description of the action
   * @param fn The function to wrap
   * @param metadata Additional metadata for the action
   * @returns The wrapped function
   */
  wrapWithActionRecording<T>(
    action: string,
    description: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {
      const { stepId } = await this.recordAction(action, description, metadata);

      try {
        const result = await fn();
        await this.completeAction(stepId, true, undefined, result);
        resolve(result);
      } catch (error) {
        await this.completeAction(
          stepId,
          false,
          error instanceof Error ? error.message : String(error)
        );
        reject(error);
      }
    });
  }
}
