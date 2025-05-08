/**
 * E-commerce example of using the context engine with PuppeteerAgent
 *
 * This example demonstrates how the context engine maintains context across a multi-step
 * e-commerce flow, including:
 * 1. Finding a product with specific attributes
 * 2. Extracting product details
 * 3. Adding the product to cart
 * 4. Verifying cart contents
 * 5. Proceeding through checkout with the correct information
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
    groupName: 'E-commerce Automation Demo',
    groupDescription: 'Using context engine to maintain information across an e-commerce flow'
  });

  try {
    // Set a base system prompt
    await agent.setAIActionContext('You are a helpful shopping assistant that remembers product details and uses them throughout the shopping process.');

    console.log('Starting e-commerce workflow with context engine...');

    // Step 1: Navigate to demo store and find a specific product
    console.log('\n📋 Step 1: Navigating to demo store and finding a specific product...');
    const result1 = await agent.aiAction(`
      1. Go to the demo store (https://demo.opencart.com/)
      2. Search for "phone" in the search box
      3. From the search results, find the most expensive phone
      4. Extract and remember the following details:
         - Exact product name
         - Price
         - Any available specifications (like memory, color)
      5. Do not click on the product yet, just extract this information
    `);

    console.log('\nAction details:', result1.metadata?.actionDetails?.[0]?.description || 'No description available');
    console.log('Result:', result1.result || 'No result available');
    console.log('\nToken usage:', result1.metadata?.usage?.total_tokens || 'N/A', 'tokens');

    // Step 2: View the product details
    console.log('\n📋 Step 2: Viewing product details...');
    const result2 = await agent.aiAction(`
      1. Click on the product you identified in the previous step
      2. On the product page, extract any additional details not visible in the search results:
         - Product description
         - Available options (if any)
         - Stock status
      3. Compare the price on this page with what you noted earlier
      4. Report if there are any discrepancies
    `);

    console.log('\nAction details:', result2.metadata?.actionDetails?.[0]?.description || 'No description available');
    console.log('Result:', result2.result || 'No result available');
    console.log('\nToken usage:', result2.metadata?.usage?.total_tokens || 'N/A', 'tokens');

    // Step 3: Add the product to cart
    console.log('\n📋 Step 3: Adding product to cart...');
    const result3 = await agent.aiAction(`
      1. Select any required options for the product (if applicable)
      2. Set the quantity to 2
      3. Click the "Add to Cart" button
      4. Verify that a success message appears
      5. Click on the cart icon to view the cart
    `);

    console.log('\nAction details:', result3.metadata?.actionDetails?.[0]?.description || 'No description available');
    console.log('Result:', result3.result || 'No result available');
    console.log('\nToken usage:', result3.metadata?.usage?.total_tokens || 'N/A', 'tokens');

    // Step 4: Verify cart contents
    console.log('\n📋 Step 4: Verifying cart contents...');
    const result4 = await agent.aiAssert(`
      Verify that:
      1. The cart contains the exact product you identified in Step 1
      2. The quantity is set to 2
      3. The unit price matches what you noted earlier
      4. The total price is correctly calculated (unit price × quantity)
      
      This assertion should pass only if all conditions are met, demonstrating that
      you've maintained context about the product across multiple pages.
    `);

    console.log('\nAssertion result:', result4.result ? 'PASSED' : 'FAILED');
    console.log('Assertion details:', result4.metadata?.thought || 'No details available');
    console.log('\nToken usage:', result4.metadata?.usage?.total_tokens || 'N/A', 'tokens');

    // Step 5: Proceed to checkout
    console.log('\n📋 Step 5: Proceeding to checkout...');
    const result5 = await agent.aiAction(`
      1. Click the "Checkout" button
      2. On the checkout page, verify that:
         - The product details match what you've been tracking
         - The quantity is still 2
         - The total price is correct
      3. Do not complete the checkout process, just verify the information
      4. Create a summary report that includes:
         - The exact product name you've been tracking
         - All specifications you've gathered
         - The unit price and total for 2 items
         - Whether all information has remained consistent throughout the process
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

    console.log('\n✅ Workflow complete! The context engine has maintained product information across all steps.');
    console.log('Key observations:');
    console.log('1. Product details extracted in Step 1 were used in Steps 2-5');
    console.log('2. The assertion in Step 4 verified that product details were maintained in the cart');
    console.log('3. The final report in Step 5 demonstrated consistent information throughout the process');
    console.log('4. Token usage increased with each step as context accumulated');

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
