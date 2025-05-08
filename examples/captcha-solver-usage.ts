/**
 * Example of using the aiCaptcha method to solve captchas
 *
 * This example demonstrates how to use deepthink to focus on captcha elements
 * for more accurate captcha solving.
 */

import { PuppeteerAgent } from '@acabai/web';
import puppeteer from 'puppeteer';

async function main() {
  // Launch a browser
  const browser = await puppeteer.launch({ headless: false });

  // Create a new page
  const page = await browser.newPage();

  // Create a page agent
  const agent = new PuppeteerAgent(page);

  try {
    // Navigate to a website with a captcha
    await page.goto('https://www.google.com/recaptcha/api2/demo');

    console.log('Attempting to solve captcha with basic settings...');

    // Basic usage - solve captcha with default settings
    const result = await agent.aiCaptcha();
    console.log('Captcha solving result:', result.result);

    // Wait a moment before trying the next approach
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Refresh the page to get a fresh captcha
    await page.reload();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // If you need to customize the captcha solving process with deepthink:
    console.log('Attempting to solve captcha with deepthink focus...');

    const customResult = await agent.aiCaptcha({
      // Try up to 5 times
      maxAttempts: 5,

      // Set a timeout of 2 minutes per attempt
      timeout: 120000,

      // Enable deepthink for better captcha analysis
      deepThink: true,

      // Add custom instructions for specific captcha types
      customInstructions: `
        For this specific website:
        - The checkbox reCAPTCHA is located in an iframe
        - First, carefully analyze the iframe content
        - Click the checkbox first
        - If an image challenge appears, take your time to analyze each image carefully
        - Solve it by clicking all matching images
        - The verify button is at the bottom right of the challenge window
        - Use deepthink to carefully analyze the captcha before taking any action
      `
    });

    console.log('Custom captcha solving result with deepthink:', customResult.result);

    // You can also log the metadata to see the analysis details
    console.log('Analysis metadata:', customResult.metadata || 'No metadata available');

    // Example of handling different captcha types

    // 1. Text-based captcha example with deepthink
    await page.goto('https://www.captcha.net/');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\nAttempting to solve text-based captcha with deepthink...');

    const textCaptchaResult = await agent.aiCaptcha({
      // Enable deepthink for better text captcha analysis
      deepThink: true,

      customInstructions: `
        This is a text-based captcha example:
        - Use deepthink to carefully analyze the distorted text in the image
        - Take your time to identify each character correctly
        - Pay attention to any distortions, overlaps, or special characters
        - Enter the text in the input field exactly as shown
        - Click the submit button
      `
    });

    console.log('Text captcha result with deepthink:', textCaptchaResult.result);

    // Log the deepthink analysis for text captcha
    console.log('Text captcha deepthink analysis:',
      textCaptchaResult.metadata?.deepthink || 'No deepthink analysis available');

    // 2. hCaptcha example with deepthink
    await page.goto('https://www.hcaptcha.com/showcase');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\nAttempting to solve hCaptcha with deepthink...');

    const hCaptchaResult = await agent.aiCaptcha({
      // Enable deepthink for better hCaptcha analysis
      deepThink: true,

      // Set a longer timeout for hCaptcha as it can be more complex
      timeout: 180000,

      // Increase attempts for better success rate
      maxAttempts: 3,

      customInstructions: `
        This is an hCaptcha example:
        - First, use deepthink to carefully analyze the hCaptcha challenge
        - Click the checkbox first to initiate the challenge
        - When the image challenge appears:
          1. Use deepthink to carefully analyze each image
          2. Read the challenge instructions very carefully
          3. Take time to understand exactly what types of images you need to select
          4. Select all images that match the criteria with high confidence
          5. If unsure about an image, analyze it more carefully before deciding
        - Click the verify button when done
        - If the challenge refreshes with new images, repeat the analysis process
      `
    });

    console.log('hCaptcha result with deepthink:', hCaptchaResult.result);

    // Log the deepthink analysis for hCaptcha
    console.log('hCaptcha deepthink analysis:',
      hCaptchaResult.metadata?.deepthink || 'No deepthink analysis available');

    // Log overall captcha solving statistics
    console.log('\n📊 Captcha Solving Statistics:');
    console.log('reCAPTCHA attempts:', customResult.metadata?.attempts || 'N/A');
    console.log('Text CAPTCHA attempts:', textCaptchaResult.metadata?.attempts || 'N/A');
    console.log('hCAPTCHA attempts:', hCaptchaResult.metadata?.attempts || 'N/A');

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
