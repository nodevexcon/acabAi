/**
 * Advanced example of analyzing the context engine during a complex test
 *
 * This example demonstrates how to:
 * 1. Track context changes between steps
 * 2. Analyze how information is maintained across steps
 * 3. Visualize the growth of context over time
 * 4. Debug context-related issues
 */

import { PuppeteerAgent } from '@acabai/web';
import puppeteer from 'puppeteer';
import { 
  getContextData, 
  printContextData, 
  getAiContext 
} from './context-engine-helper';
import fs from 'fs';
import path from 'path';

// Interface for tracking context metrics
interface ContextMetrics {
  step: number;
  stepDescription: string;
  timestamp: number;
  stepCount: number;
  summaryCount: number;
  totalTokenEstimate: number;
  contextLength: number;
}

async function main() {
  // Launch a browser
  const browser = await puppeteer.launch({ headless: false });

  // Create a new page
  const page = await browser.newPage();

  // Create a page agent with context engine enabled
  const agent = new PuppeteerAgent(page, {
    useContextEngine: true,
    contextEngineMaxSteps: 10,
    groupName: 'Context Engine Analysis Demo',
    groupDescription: 'Analyzing context engine behavior during a complex test'
  });

  // Array to track context metrics over time
  const contextMetrics: ContextMetrics[] = [];

  try {
    // Set a base system prompt
    await agent.setAIActionContext('You are a helpful assistant that remembers information across steps.');

    console.log('Starting context engine analysis...');

    // Helper function to record metrics after each step
    async function recordMetricsAfterStep(stepNumber: number, description: string) {
      const contextData = getContextData(agent);
      if (!contextData || !contextData.currentRun) {
        console.error('No context data available');
        return;
      }

      const steps = contextData.currentRun.steps;
      const summaryCount = steps.filter(step => step.summary).length;
      
      // Get the AI context and estimate token count (rough estimate: 1 token ≈ 4 chars)
      const aiContext = getAiContext(agent) || '';
      const contextLength = aiContext.length;
      const totalTokenEstimate = Math.ceil(contextLength / 4);
      
      // Record metrics
      contextMetrics.push({
        step: stepNumber,
        stepDescription: description,
        timestamp: Date.now(),
        stepCount: steps.length,
        summaryCount,
        totalTokenEstimate,
        contextLength
      });
      
      // Print current metrics
      console.log(`\n📊 Context Metrics after Step ${stepNumber}:`);
      console.log(`- Steps in context: ${steps.length}`);
      console.log(`- Steps with summaries: ${summaryCount}`);
      console.log(`- Context length (chars): ${contextLength}`);
      console.log(`- Estimated tokens: ${totalTokenEstimate}`);
      
      // Save the current context to a file for debugging
      const debugDir = path.join(__dirname, 'debug');
      if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir);
      }
      
      fs.writeFileSync(
        path.join(debugDir, `context_step_${stepNumber}.txt`),
        aiContext
      );
      
      // Print the full context data
      console.log(`\n🔍 Full Context after Step ${stepNumber}:`);
      printContextData(agent, { includeMetadata: false });
    }

    // Step 1: Navigate to a website
    console.log('\n📋 Step 1: Navigating to a website...');
    await agent.aiAction(`
      1. Go to Wikipedia (https://www.wikipedia.org)
      2. Wait for the page to load completely
    `);
    await recordMetricsAfterStep(1, 'Navigate to Wikipedia');

    // Step 2: Search for something
    console.log('\n📋 Step 2: Searching for a topic...');
    await agent.aiAction(`
      1. Find the search box
      2. Type "Machine Learning" in the search box
      3. Press Enter or click the search button
      4. Wait for the search results to load
    `);
    await recordMetricsAfterStep(2, 'Search for Machine Learning');

    // Step 3: Extract information
    console.log('\n📋 Step 3: Extracting information...');
    await agent.aiAction(`
      1. Find the first paragraph of the Machine Learning article
      2. Extract the definition of Machine Learning
      3. Note any key people mentioned in the introduction
    `);
    await recordMetricsAfterStep(3, 'Extract information');

    // Step 4: Navigate to a related page
    console.log('\n📋 Step 4: Navigating to a related page...');
    await agent.aiAction(`
      1. Find a link to "Artificial Intelligence" in the article
      2. Click on that link
      3. Wait for the page to load
    `);
    await recordMetricsAfterStep(4, 'Navigate to related page');

    // Step 5: Compare information
    console.log('\n📋 Step 5: Comparing information...');
    await agent.aiAction(`
      1. Find the definition of Artificial Intelligence
      2. Compare it with the definition of Machine Learning you found earlier
      3. Note the key differences between the two fields
    `);
    await recordMetricsAfterStep(5, 'Compare information');

    // Generate a report on context growth
    console.log('\n📈 Context Growth Analysis:');
    console.log('Step | Description | Steps | Summaries | Context Length | Est. Tokens');
    console.log('-----|-------------|-------|-----------|----------------|------------');
    contextMetrics.forEach(metric => {
      console.log(
        `${metric.step.toString().padEnd(5)} | ` +
        `${metric.stepDescription.substring(0, 11).padEnd(11)} | ` +
        `${metric.stepCount.toString().padEnd(7)} | ` +
        `${metric.summaryCount.toString().padEnd(11)} | ` +
        `${metric.contextLength.toString().padEnd(16)} | ` +
        `${metric.totalTokenEstimate}`
      );
    });

    // Calculate growth rates
    if (contextMetrics.length > 1) {
      const firstMetric = contextMetrics[0];
      const lastMetric = contextMetrics[contextMetrics.length - 1];
      const totalGrowth = lastMetric.contextLength - firstMetric.contextLength;
      const growthPerStep = totalGrowth / (contextMetrics.length - 1);
      
      console.log('\n📊 Context Growth Statistics:');
      console.log(`- Initial context length: ${firstMetric.contextLength} chars`);
      console.log(`- Final context length: ${lastMetric.contextLength} chars`);
      console.log(`- Total growth: ${totalGrowth} chars`);
      console.log(`- Average growth per step: ${growthPerStep.toFixed(2)} chars`);
      console.log(`- Initial token estimate: ${firstMetric.totalTokenEstimate}`);
      console.log(`- Final token estimate: ${lastMetric.totalTokenEstimate}`);
    }

    // Save metrics to a CSV file
    const csvContent = [
      'Step,Description,Timestamp,StepCount,SummaryCount,ContextLength,EstimatedTokens',
      ...contextMetrics.map(metric => 
        `${metric.step},"${metric.stepDescription}",${metric.timestamp},${metric.stepCount},${metric.summaryCount},${metric.contextLength},${metric.totalTokenEstimate}`
      )
    ].join('\n');
    
    fs.writeFileSync(
      path.join(__dirname, 'debug', 'context_metrics.csv'),
      csvContent
    );
    
    console.log('\n✅ Context engine analysis complete!');
    console.log('Metrics have been saved to debug/context_metrics.csv');
    console.log('Context snapshots have been saved to the debug directory');

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
