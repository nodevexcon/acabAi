# Context Engine Helper Tools

This directory contains helper tools and examples for working with the acabAI context engine. These tools allow you to inspect, analyze, and debug the context engine during test runs.

## Helper Functions

The `context-engine-helper.ts` file provides several utility functions for working with the context engine:

### Basic Functions

- `getContextData(agent)`: Retrieves the raw context data from a PuppeteerAgent
- `printContextData(agent, options)`: Prints a formatted representation of the context data
- `getContextDataAsJson(agent)`: Returns the context data as a JSON string
- `extractSummaries(agent)`: Extracts all summaries from the context
- `getAiContext(agent)`: Gets the context that would be sent to the AI model

### Usage Example

```typescript
import { printContextData, getAiContext } from './context-engine-helper';

// After performing some actions with your agent
printContextData(agent);

// Get the context that would be sent to the AI
const aiContext = getAiContext(agent);
console.log(aiContext);
```

## Example Files

This directory includes several examples demonstrating different aspects of the context engine:

### 1. Basic Usage Example

`context-engine-usage.ts` - Demonstrates basic usage of the context engine with a Wikipedia research workflow.

Run with:
```
npx ts-node examples/context-engine-usage.ts
```

### 2. Practical Test Example

`context-engine-practical-test.ts` - Shows a practical form automation test that extracts text from one page and uses it in another.

Run with:
```
npx ts-node examples/context-engine-practical-test.ts
```

### 3. E-commerce Test Example

`context-engine-ecommerce-test.ts` - Demonstrates an e-commerce flow that maintains product information across multiple pages.

Run with:
```
npx ts-node examples/context-engine-ecommerce-test.ts
```

### 4. Data Extraction Test Example

`context-engine-data-extraction-test.ts` - Shows how to extract and maintain complex structured data across steps.

Run with:
```
npx ts-node examples/context-engine-data-extraction-test.ts
```

### 5. Context Inspector Example

`context-engine-inspector.ts` - Demonstrates how to use the helper functions to inspect the context engine.

Run with:
```
npx ts-node examples/context-engine-inspector.ts
```

### 6. Context Analyzer Example

`context-engine-analyzer.ts` - Shows advanced analysis of context growth and behavior during a complex test.

Run with:
```
npx ts-node examples/context-engine-analyzer.ts
```

## Understanding the Context Structure

The context engine maintains the following structure:

```
ContextEngine
├── currentTestRun: TestRunContext
│   ├── id: string
│   ├── name: string
│   ├── description?: string
│   ├── steps: TestStepContext[]
│   │   ├── id: string
│   │   ├── action: string
│   │   ├── description: string
│   │   ├── result: 'pending' | 'success' | 'failure'
│   │   ├── error?: string
│   │   ├── summary?: string
│   │   ├── metadata?: Record<string, any>
│   │   └── timestamp: number
│   ├── result: 'pending' | 'success' | 'failure'
│   ├── summary?: string
│   ├── timestamp: number
│   └── completedTimestamp?: number
└── testRunHistory: TestRunContext[]
```

## How the Context Engine Works

1. When you create a PuppeteerAgent with `useContextEngine: true`, it initializes a ContextEngine instance.
2. Each time you call `aiAction()` or similar methods, the context engine:
   - Records the action as a step
   - Generates a summary of the step when it completes
   - Maintains these summaries in the context
3. When subsequent actions are performed, the context engine includes summaries of previous steps in the prompt sent to the AI model.
4. This allows the AI to maintain context across multiple steps, remembering information from earlier steps.

## Debugging Tips

1. Use `printContextData(agent)` to see the current state of the context engine.
2. Use `getAiContext(agent)` to see exactly what context is being sent to the AI model.
3. If you're experiencing issues with the context engine:
   - Check if summaries are being generated correctly
   - Verify that the context is growing appropriately with each step
   - Look for any errors in the step results

## Advanced Usage

For advanced analysis, the `context-engine-analyzer.ts` example shows how to:

1. Track context metrics over time
2. Visualize context growth
3. Save context snapshots for debugging
4. Generate reports on context behavior

This can be helpful for optimizing your tests and understanding how the context engine behaves in complex scenarios.
