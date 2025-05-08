/**
 * Example of using the context engine helper functions
 *
 * This example demonstrates how to use the helper functions to inspect
 * the internal state of the context engine during a test run.
 */

import { PuppeteerAgent } from '@acabai/web';
import puppeteer from 'puppeteer';
import { 
  printContextData, 
  getContextDataAsJson, 
  extractSummaries,
  getAiContext 
} from './context-engine-helper';

async function main() {
  // Launch a browser
  const browser = await puppeteer.launch({ headless: false });

  // Create a new page
  const page = await browser.newPage();

  // Create a page agent with context engine enabled
  const agent = new PuppeteerAgent(page, {
    useContextEngine: true,
    contextEngineMaxSteps: 10,
    groupName: 'Context Engine Inspector Demo',
    groupDescription: 'Demonstrating how to inspect the context engine'
  });

  try {
    // Set a base system prompt
    await agent.setAIActionContext('You are a helpful assistant that remembers information across steps.');

    console.log('Starting context engine inspection demo...');

    // Step 1: Perform a simple action
    console.log('\n📋 Step 1: Performing a simple action...');
    await agent.aiAction(`
      1. Go to Google (https://www.google.com)
      2. Wait for the page to load completely
    `);

    // Inspect the context after step 1
    console.log('\n🔍 Context after Step 1:');
    printContextData(agent);

    // Step 2: Perform another action
    console.log('\n📋 Step 2: Performing another action...');
    await agent.aiAction(`
      1. Type "context engine example" in the search box
      2. Press Enter to search
      3. Wait for the search results to load
    `);

    // Inspect the context after step 2
    console.log('\n🔍 Context after Step 2:');
    printContextData(agent, { includeMetadata: true });

    // Step 3: Extract information
    console.log('\n📋 Step 3: Extracting information...');
    await agent.aiAction(`
      1. Extract the number of search results found
      2. Note the first three search result titles
    `);

    // Get the AI context that would be sent to the model
    console.log('\n🧠 AI Context after Step 3:');
    const aiContext = getAiContext(agent);
    console.log(aiContext);

    // Extract all summaries
    console.log('\n📝 All Summaries:');
    const summaries = extractSummaries(agent);
    console.log('Step Summaries:');
    summaries.stepSummaries.forEach(item => {
      console.log(`- ${item.step}: "${item.summary}"`);
    });
    console.log('\nRun Summaries:');
    summaries.runSummaries.forEach(item => {
      console.log(`- ${item.run}: "${item.summary}"`);
    });

    // Get the raw JSON data
    console.log('\n📊 Raw Context Data (JSON):');
    const jsonData = getContextDataAsJson(agent);
    console.log(jsonData);

    // Step 4: Perform an assertion
    console.log('\n📋 Step 4: Performing an assertion...');
    await agent.aiAssert(`
      Verify that:
      1. We are on a Google search results page
      2. The search query was "context engine example"
    `);

    // Final context inspection
    console.log('\n🔍 Final Context:');
    printContextData(agent, { 
      includeMetadata: true, 
      includeTimestamps: true 
    });

    console.log('\n✅ Context engine inspection complete!');
    console.log('This example demonstrated how to use the helper functions to inspect the context engine.');

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
