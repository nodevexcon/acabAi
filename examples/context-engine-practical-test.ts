/**
 * Practical example of using the context engine with PuppeteerAgent
 *
 * This example demonstrates how the context engine remembers information from previous steps
 * and uses it in subsequent actions, with a focus on practical web automation tasks:
 * 1. Extracting text from one page
 * 2. Using that text in another page
 * 3. Verifying the information was correctly used
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
    groupName: 'Form Automation Demo',
    groupDescription: 'Using context engine to extract and use information across steps'
  });

  try {
    // Set a base system prompt
    await agent.setAIActionContext('You are a helpful automation assistant that extracts information and uses it in subsequent steps.');

    console.log('Starting form automation workflow with context engine...');

    // Step 1: Go to a demo form page and extract information
    console.log('\n📋 Step 1: Navigating to demo form page and extracting unique ID...');
    const result1 = await agent.aiAction(`
      1. Go to the demo form page (https://demoqa.com/text-box)
      2. Look for the page title and header
      3. Extract the exact text of the page header
      4. Also note any form field labels you see
    `);

    console.log('\nAction details:', result1.metadata?.actionDetails?.[0]?.description || 'No description available');
    console.log('Result:', result1.result || 'No result available');
    console.log('\nToken usage:', result1.metadata?.usage?.total_tokens || 'N/A', 'tokens');

    // Step 2: Fill out the form using information from the previous step
    console.log('\n📋 Step 2: Filling out the form using extracted information...');
    const result2 = await agent.aiAction(`
      Using the information you extracted in the previous step:
      1. In the "Full Name" field, enter "Test User for [Page Header]" where [Page Header] is the exact header text you extracted
      2. In the "Email" field, enter "test@example.com"
      3. In the "Current Address" field, enter "123 Test Street"
      4. In the "Permanent Address" field, enter "Same as current address"
      5. Click the Submit button
    `);

    console.log('\nAction details:', result2.metadata?.actionDetails?.[0]?.description || 'No description available');
    console.log('Result:', result2.result || 'No result available');
    console.log('\nToken usage:', result2.metadata?.usage?.total_tokens || 'N/A', 'tokens');
    console.log('Note: The increased token count shows the context engine is including previous steps');

    // Step 3: Verify the submitted information
    console.log('\n📋 Step 3: Verifying the submitted information...');
    const result3 = await agent.aiAction(`
      1. Check if the form submission was successful
      2. Verify that the displayed name contains the page header you extracted in Step 1
      3. Confirm that all the information you entered is correctly displayed
      4. Report whether all the information matches what you entered
    `);

    console.log('\nAction details:', result3.metadata?.actionDetails?.[0]?.description || 'No description available');
    console.log('Result:', result3.result || 'No result available');
    console.log('\nToken usage:', result3.metadata?.usage?.total_tokens || 'N/A', 'tokens');

    // Step 4: Navigate to another page and use the same information
    console.log('\n📋 Step 4: Navigating to another page and using the same information...');
    const result4 = await agent.aiAction(`
      1. Go to another form page (https://demoqa.com/automation-practice-form)
      2. In the "First Name" field, enter the page header text you extracted in Step 1
      3. In the "Last Name" field, enter "Verification Test"
      4. In the "Email" field, enter the same email you used before
      5. Don't submit this form, just fill it out
    `);

    console.log('\nAction details:', result4.metadata?.actionDetails?.[0]?.description || 'No description available');
    console.log('Result:', result4.result || 'No result available');
    console.log('\nToken usage:', result4.metadata?.usage?.total_tokens || 'N/A', 'tokens');

    // Step 5: Perform an assertion to verify context was maintained
    console.log('\n📋 Step 5: Performing assertion to verify context was maintained...');
    const result5 = await agent.aiAssert(`
      Verify that:
      1. The "First Name" field contains exactly the page header text you extracted in Step 1
      2. The "Last Name" field contains "Verification Test"
      3. The "Email" field contains "test@example.com"
      
      This assertion should pass only if all three conditions are met, demonstrating that
      you've maintained context across multiple pages and steps.
    `);

    console.log('\nAssertion result:', result5.result ? 'PASSED' : 'FAILED');
    console.log('Assertion details:', result5.metadata?.thought || 'No details available');
    console.log('\nToken usage:', result5.metadata?.usage?.total_tokens || 'N/A', 'tokens');

    // Show token usage statistics to demonstrate context growth
    console.log('\n📊 Token Usage Statistics (showing context growth):');
    console.log('Step 1:', result1.metadata?.usage?.total_tokens || 'N/A', 'tokens');
    console.log('Step 2:', result2.metadata?.usage?.total_tokens || 'N/A', 'tokens');
    console.log('Step 3:', result3.metadata?.usage?.total_tokens || 'N/A', 'tokens');
    console.log('Step 4:', result4.metadata?.usage?.total_tokens || 'N/A', 'tokens');
    console.log('Step 5:', result5.metadata?.usage?.total_tokens || 'N/A', 'tokens');

    console.log('\n✅ Workflow complete! The context engine has maintained information across all steps.');
    console.log('Key observations:');
    console.log('1. Information extracted in Step 1 was used in Steps 2, 4, and 5');
    console.log('2. The assertion in Step 5 verified that context was maintained across different pages');
    console.log('3. Token usage increased with each step as context accumulated');

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
