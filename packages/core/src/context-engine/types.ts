/**
 * Options for creating a context engine
 */
export interface ContextEngineOptions {
  /**
   * Maximum number of steps to keep in the context
   * @default 10
   */
  maxSteps?: number;
  
  /**
   * Whether to use AI for generating summaries
   * @default true
   */
  useAiSummaries?: boolean;
}

/**
 * Options for creating a test run
 */
export interface CreateTestRunOptions {
  /**
   * Name of the test run
   */
  name: string;
  
  /**
   * Description of the test run
   */
  description?: string;
}

/**
 * Options for creating a test step
 */
export interface CreateTestStepOptions {
  /**
   * The action performed (e.g., 'click', 'input', 'assert')
   */
  action: string;
  
  /**
   * Description of the step
   */
  description: string;
  
  /**
   * Additional metadata for the step
   */
  metadata?: Record<string, any>;
}

/**
 * Status of a test step
 */
export type TestStepStatus = 'pending' | 'success' | 'failure';

/**
 * Context for a test step
 */
export interface TestStepContext {
  /**
   * Unique ID of the step
   */
  id: string;
  
  /**
   * The action performed
   */
  action: string;
  
  /**
   * Description of the step
   */
  description: string;
  
  /**
   * Result of the step
   */
  result: TestStepStatus;
  
  /**
   * Error message if the step failed
   */
  error?: string;
  
  /**
   * AI-generated summary of the step
   */
  summary?: string;
  
  /**
   * Additional metadata for the step
   */
  metadata?: Record<string, any>;
  
  /**
   * Timestamp when the step was created
   */
  timestamp: number;
}

/**
 * Context for a test run
 */
export interface TestRunContext {
  /**
   * Unique ID of the test run
   */
  id: string;
  
  /**
   * Name of the test run
   */
  name: string;
  
  /**
   * Description of the test run
   */
  description?: string;
  
  /**
   * Steps in the test run
   */
  steps: TestStepContext[];
  
  /**
   * Result of the test run
   */
  result: TestStepStatus;
  
  /**
   * AI-generated summary of the test run
   */
  summary?: string;
  
  /**
   * Timestamp when the test run was created
   */
  timestamp: number;
  
  /**
   * Timestamp when the test run was completed
   */
  completedTimestamp?: number;
}
