/**
 * Example of using the context engine with PuppeteerAgent
 *
 * This example demonstrates how the context engine remembers information from previous steps
 * and uses it in subsequent actions, creating a continuous flow of information.
 */

import { PuppeteerAgent } from '@acabai/web';
import puppeteer from 'puppeteer';

async function main() {
  // Launch a browser
  const browser = await puppeteer.launch({ headless: false });

  // Create a new page
  const page = await browser.newPage();

  // Create a page agent with context engine enabled
  const agent = new PuppeteerAgent(page, {
    useContextEngine: true,
    contextEngineMaxSteps: 10,
    groupName: 'Wikipedia Research Demo',
    groupDescription: 'Using context engine to gather and use information across steps'
  });

  try {
    // Set a base system prompt
    await agent.setAIActionContext('You are a helpful research assistant that gathers information and uses it in subsequent steps.');

    console.log('Starting Wikipedia research workflow with context engine...');

    // Step 1: Go to Wikipedia and search for a person
    console.log('\n📋 Step 1: Navigating to Wikipedia and searching for a person...');
    const result1 = await agent.aiAction(`
      1. Go to Wikipedia (https://www.wikipedia.org)
      2. Search for "Nikola Tesla"
      3. Click on the search result for Nikola Tesla's page
      4. Tell me when you've reached his page
    `);

    // Display the full result object to see what's available
    console.log('Full result object structure:');
    console.log(JSON.stringify(result1, null, 2).substring(0, 500) + '...');

    // Extract useful information from metadata
    const actionDetails = result1.metadata?.actionDetails?.[0] || {};
    const tasks = result1.metadata?.tasks?.[0] || {};
    const planningSteps = result1.metadata?.planning?.steps || [];

    console.log('\nAction details:', actionDetails.description || 'No description available');
    console.log('Task completed:', tasks.description || 'No task description available');
    console.log('\nPlanning steps:');
    planningSteps.forEach((step, index) => {
      console.log(`${index + 1}. ${step.description || 'No step description'}`);
    });

    // Step 2: Extract basic information about the person
    // The context engine will include a summary of the previous step
    console.log('\n📋 Step 2: Extracting basic information...');
    const result2 = await agent.aiAction(`
      Extract the following information about the person:
      - Full name
      - Birth date and place
      - Death date and place
      - Profession/occupation
      - What they're known for

      Format the information clearly.
    `);

    // Extract useful information from metadata
    const actionDetails2 = result2.metadata?.actionDetails?.[0] || {};
    console.log('\nAction details:', actionDetails2.description || 'No description available');

    // If there's a result, show it, otherwise show the task description
    if (result2.result) {
      console.log('Result:', result2.result);
    } else {
      const tasks2 = result2.metadata?.tasks?.[0] || {};
      console.log('Task completed:', tasks2.description || 'No task description available');
    }

    // Show token usage to demonstrate context engine in action
    console.log('\nToken usage:', result2.metadata?.usage || 'No usage data available');
    console.log('Note: The increased token count in the prompt shows the context engine is including previous steps');

    // Step 3: Find specific achievements
    // The context engine will include summaries of steps 1 and 2
    console.log('\n📋 Step 3: Finding specific achievements...');
    const result3 = await agent.aiAction(`
      Look through the page and find:
      1. At least 3 major inventions or contributions
      2. Any awards or recognitions they received

      Summarize these achievements.
    `);

    // Extract useful information from metadata
    const actionDetails3 = result3.metadata?.actionDetails?.[0] || {};
    console.log('\nAction details:', actionDetails3.description || 'No description available');

    // If there's a result, show it, otherwise show the task description
    if (result3.result) {
      console.log('Result:', result3.result);
    } else {
      const tasks3 = result3.metadata?.tasks?.[0] || {};
      console.log('Task completed:', tasks3.description || 'No task description available');
    }

    // Compare token usage with previous steps to show context growth
    console.log('\nToken usage comparison:');
    console.log('Step 1:', result1.metadata?.usage?.total_tokens || 'N/A', 'tokens');
    console.log('Step 2:', result2.metadata?.usage?.total_tokens || 'N/A', 'tokens');
    console.log('Step 3:', result3.metadata?.usage?.total_tokens || 'N/A', 'tokens');
    console.log('Note: The increasing token count shows the context engine accumulating information');

    // Step 4: Navigate to a related page using information from previous steps
    // The context engine will include summaries of steps 1, 2, and 3
    console.log('\n📋 Step 4: Navigating to a related page...');
    const result4 = await agent.aiAction(`
      1. Find a link related to one of the inventions or contributions you mentioned in the previous step
      2. Click on that link to navigate to the page
      3. Tell me what page you've navigated to
    `);

    // Extract useful information from metadata
    const actionDetails4 = result4.metadata?.actionDetails?.[0] || {};
    console.log('\nAction details:', actionDetails4.description || 'No description available');

    // If there's a result, show it, otherwise show the task description
    if (result4.result) {
      console.log('Result:', result4.result);
    } else {
      const tasks4 = result4.metadata?.tasks?.[0] || {};
      console.log('Task completed:', tasks4.description || 'No task description available');

      // Try to extract the URL from the metadata if available
      const currentUrl = actionDetails4.url || 'URL not available';
      console.log('Current page URL:', currentUrl);
    }

    // Show planning to demonstrate context-aware decision making
    console.log('\nPlanning for this step:');
    const planningSteps4 = result4.metadata?.planning?.steps || [];
    planningSteps4.forEach((step: any, index: number) => {
      console.log(`${index + 1}. ${step.description || 'No step description'}`);
    });

    // Step 5: Compare information using context from all previous steps
    // The context engine will include summaries of steps 1, 2, 3, and 4
    console.log('\n📋 Step 5: Creating a report using all gathered information...');
    const result5 = await agent.aiAction(`
      Based on all the information you've gathered across all previous steps:
      1. Create a brief report about Nikola Tesla and the related topic you navigated to
      2. Explain how they are connected
      3. Include the most important facts you've learned
      4. Specifically reference information from each of the previous steps

      This should demonstrate how you're using information from all previous steps.
    `);

    // Extract useful information from metadata
    const actionDetails5 = result5.metadata?.actionDetails?.[0] || {};
    console.log('\nAction details:', actionDetails5.description || 'No description available');

    // If there's a result, show it, otherwise show the task description
    if (result5.result) {
      console.log('Result:', result5.result);
    } else {
      const tasks5 = result5.metadata?.tasks?.[0] || {};
      console.log('Task completed:', tasks5.description || 'No task description available');
    }

    // Show final token usage statistics to demonstrate context growth
    console.log('\n📊 Token Usage Statistics (showing context growth):');
    console.log('Step 1:', result1.metadata?.usage?.total_tokens || 'N/A', 'tokens');
    console.log('Step 2:', result2.metadata?.usage?.total_tokens || 'N/A', 'tokens');
    console.log('Step 3:', result3.metadata?.usage?.total_tokens || 'N/A', 'tokens');
    console.log('Step 4:', result4.metadata?.usage?.total_tokens || 'N/A', 'tokens');
    console.log('Step 5:', result5.metadata?.usage?.total_tokens || 'N/A', 'tokens');

    console.log('\n✅ Workflow complete! The context engine has maintained information across all steps.');
    console.log('Each step built upon knowledge from previous steps, creating a continuous research flow.');
    console.log('\n🔍 Key observations:');
    console.log('1. Notice how token usage increases with each step as context accumulates');
    console.log('2. The AI can reference information from previous steps without being explicitly told');
    console.log('3. The context engine allows for a coherent multi-step workflow with information retention');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Clean up
    await agent.destroy();
    await browser.close();
  }
}

// Run the example
main().catch(console.error);
