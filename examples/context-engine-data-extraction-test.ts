/**
 * Data extraction example of using the context engine with PuppeteerAgent
 *
 * This example demonstrates how the context engine maintains complex data across multiple steps,
 * with a focus on:
 * 1. Extracting structured data from tables
 * 2. Using that data to make decisions
 * 3. Verifying data consistency across different pages
 * 4. Performing calculations based on extracted data
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
    groupName: 'Data Extraction Demo',
    groupDescription: 'Using context engine to extract and process complex data across steps'
  });

  try {
    // Set a base system prompt
    await agent.setAIActionContext('You are a data extraction assistant that remembers complex information and uses it for analysis and verification.');

    console.log('Starting data extraction workflow with context engine...');

    // Step 1: Navigate to a table-based page and extract structured data
    console.log('\n📋 Step 1: Extracting table data...');
    const result1 = await agent.aiAction(`
      1. Go to the W3Schools HTML Tables example page (https://www.w3schools.com/html/html_tables.asp)
      2. Find the example table with company information
      3. Extract all data from this table as a structured dataset
      4. For each company, extract:
         - Company name
         - Contact person
         - Country
      5. Identify which company has the highest alphabetical country name
      6. Remember all this information for later use
    `);

    console.log('\nAction details:', result1.metadata?.actionDetails?.[0]?.description || 'No description available');
    console.log('Result:', result1.result || 'No result available');
    console.log('\nToken usage:', result1.metadata?.usage?.total_tokens || 'N/A', 'tokens');

    // Step 2: Navigate to another page and use the extracted data
    console.log('\n📋 Step 2: Using extracted data on another page...');
    const result2 = await agent.aiAction(`
      1. Go to the W3Schools HTML Forms page (https://www.w3schools.com/html/html_forms.asp)
      2. Find the example form
      3. In the first input field, enter the name of the company from the previous step that has the highest alphabetical country name
      4. In the second input field (if available), enter the contact person for that company
      5. Do not submit the form
    `);

    console.log('\nAction details:', result2.metadata?.actionDetails?.[0]?.description || 'No description available');
    console.log('Result:', result2.result || 'No result available');
    console.log('\nToken usage:', result2.metadata?.usage?.total_tokens || 'N/A', 'tokens');

    // Step 3: Extract more data and combine with previous data
    console.log('\n📋 Step 3: Extracting additional data and combining with previous information...');
    const result3 = await agent.aiAction(`
      1. Go to the W3Schools HTML Lists page (https://www.w3schools.com/html/html_lists.asp)
      2. Find the example ordered list
      3. Extract all items from this list
      4. Create a combined dataset that:
         - Lists all companies from Step 1
         - Pairs each company with one item from the list you just extracted (in order)
         - If there are more companies than list items, cycle through the list items again
      5. Format this as a clear table in your response
    `);

    console.log('\nAction details:', result3.metadata?.actionDetails?.[0]?.description || 'No description available');
    console.log('Result:', result3.result || 'No result available');
    console.log('\nToken usage:', result3.metadata?.usage?.total_tokens || 'N/A', 'tokens');

    // Step 4: Perform verification using all previously collected data
    console.log('\n📋 Step 4: Verifying data consistency across all steps...');
    const result4 = await agent.aiAssert(`
      Based on all the data you've collected:
      
      1. Verify that you still have the complete list of companies from Step 1
      2. Verify that you correctly identified the company with the highest alphabetical country name
      3. Verify that you successfully paired each company with a list item in Step 3
      4. Verify that you can still recall the contact person for each company
      
      This assertion should pass only if you can demonstrate that all this information has been
      maintained correctly throughout the workflow.
    `);

    console.log('\nAssertion result:', result4.result ? 'PASSED' : 'FAILED');
    console.log('Assertion details:', result4.metadata?.thought || 'No details available');
    console.log('\nToken usage:', result4.metadata?.usage?.total_tokens || 'N/A', 'tokens');

    // Step 5: Generate a comprehensive report using all collected data
    console.log('\n📋 Step 5: Generating comprehensive report using all collected data...');
    const result5 = await agent.aiAction(`
      Create a comprehensive report that:
      
      1. Lists all companies from Step 1 with their complete information
      2. Shows which company has the highest alphabetical country name
      3. Shows the pairing of companies with list items from Step 3
      4. Includes a count of the total number of data points you've maintained throughout this process
      5. Calculates what percentage of companies are from each country (e.g., "Germany: 33%")
      
      Format this as a structured report with clear sections and calculations.
    `);

    console.log('\nAction details:', result5.metadata?.actionDetails?.[0]?.description || 'No description available');
    console.log('Result:', result5.result || 'No result available');
    console.log('\nToken usage:', result5.metadata?.usage?.total_tokens || 'N/A', 'tokens');

    // Show token usage statistics to demonstrate context growth
    console.log('\n📊 Token Usage Statistics (showing context growth):');
    console.log('Step 1:', result1.metadata?.usage?.total_tokens || 'N/A', 'tokens');
    console.log('Step 2:', result2.metadata?.usage?.total_tokens || 'N/A', 'tokens');
    console.log('Step 3:', result3.metadata?.usage?.total_tokens || 'N/A', 'tokens');
    console.log('Step 4:', result4.metadata?.usage?.total_tokens || 'N/A', 'tokens');
    console.log('Step 5:', result5.metadata?.usage?.total_tokens || 'N/A', 'tokens');

    console.log('\n✅ Workflow complete! The context engine has maintained complex data across all steps.');
    console.log('Key observations:');
    console.log('1. Structured data extracted in Step 1 was used in Steps 2-5');
    console.log('2. Additional data was combined with existing data in Step 3');
    console.log('3. The assertion in Step 4 verified data consistency across all steps');
    console.log('4. The final report in Step 5 demonstrated the ability to perform calculations on maintained data');
    console.log('5. Token usage increased with each step as context accumulated');

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
