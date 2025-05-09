import { callAiFn, AIActionType } from '../ai-model/common';
import type { TestStepContext, TestRunContext } from './types';

/**
 * Generate a summary for a test step using AI
 *
 * @param step The test step to summarize
 * @returns A concise summary of the step (1-2 sentences)
 */
export async function generateStepSummary(step: TestStepContext): Promise<string> {
  try {
    // Format the action result for inclusion in the prompt
    let actionResultText = '';
    if (step.actionResult !== undefined) {
      try {
        // Try to stringify the action result if it's an object
        if (typeof step.actionResult === 'object') {
          actionResultText = `Action Result: ${JSON.stringify(step.actionResult, null, 2)}`;
        } else {
          actionResultText = `Action Result: ${step.actionResult}`;
        }
      } catch (e) {
        // If we can't stringify it, use a simpler representation
        actionResultText = `Action Result: ${String(step.actionResult)}`;
      }
    }

    const prompt = `
Summarize the following test step in 1-2 concise sentences:

Action: ${step.action}
Description: ${step.description}
Result: ${step.result === 'success' ? 'Successful' : 'Failed'}
${step.error ? `Error: ${step.error}` : ''}
${actionResultText ? `${actionResultText}` : ''}
${step.metadata ? `Metadata: ${JSON.stringify(step.metadata)}` : ''}

Your summary should be factual, concise, and focus on what was done and the outcome.
Include specific information from the action result when relevant.
`;

    const response = await callAiFn<{ summary: string }>(
      [
        { role: 'system', content: 'Generate a concise summary of the test step that includes key information from the action result.' },
        { role: 'user', content: prompt }
      ],
      AIActionType.PLAN
    );

    return response.content.summary || 'No summary available';
  } catch (error) {
    console.error('Error generating step summary:', error);
    return `${step.action} - ${step.description} (${step.result})`;
  }
}

/**
 * Generate a summary for a test run using AI
 *
 * @param testRun The test run to summarize
 * @returns A concise summary of the test run
 */
export async function generateTestRunSummary(testRun: TestRunContext): Promise<string> {
  try {
    const stepsText = testRun.steps
      .map(step => {
        return `- ${step.action}: ${step.description} (${step.result})${step.error ? ` - Error: ${step.error}` : ''}`;
      })
      .join('\n');

    const prompt = `
Summarize the following test run in 2-3 concise sentences:

Test: ${testRun.name}
${testRun.description ? `Description: ${testRun.description}` : ''}
Result: ${testRun.result === 'success' ? 'Successful' : 'Failed'}
Steps:
${stepsText}

Your summary should be factual, concise, and focus on what was done and the overall outcome.
`;

    const response = await callAiFn<{ summary: string }>(
      [
        { role: 'system', content: 'Generate a concise summary of the test run.' },
        { role: 'user', content: prompt }
      ],
      AIActionType.PLAN
    );

    return response.content.summary || 'No summary available';
  } catch (error) {
    console.error('Error generating test run summary:', error);
    return `Test run: ${testRun.name} (${testRun.result})`;
  }
}


