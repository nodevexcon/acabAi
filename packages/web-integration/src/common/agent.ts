import type { WebPage } from '@/common/page';
import {
  type AgentAssertOpt,
  type AgentWaitForOpt,
  type ExecutionDump,
  type ExecutionTask,
  type Executor,
  type GroupedActionDump,
  Insight,
  type InsightAction,
  type LocateOption,
  type OnTaskStartTip,
  type PlanningActionParamScroll,
} from '@midscene/core';

import { ScriptPlayer, parseYamlScript } from '@/yaml/index';
import {
  groupedActionDumpFileExt,
  reportHTMLContent,
  stringifyDumpData,
  writeLogFile,
} from '@midscene/core/utils';
import {
  DEFAULT_WAIT_FOR_NAVIGATION_TIMEOUT,
  DEFAULT_WAIT_FOR_NETWORK_IDLE_TIMEOUT,
} from '@midscene/shared/constants';
import { vlLocateMode } from '@midscene/shared/env';
import { getDebug } from '@midscene/shared/logger';
import { assert } from '@midscene/shared/utils';
import { PageTaskExecutor } from '../common/tasks';
import type { PuppeteerWebPage } from '../puppeteer';
import type { WebElementInfo } from '../web-element';
import { buildPlans } from './plan-builder';
import type { AiTaskCache } from './task-cache';
import {
  locateParamStr,
  paramStr,
  scrollParamStr,
  taskTitleStr,
  typeStr,
} from './ui-utils';
import { printReportMsg, reportFileName } from './utils';
import { type WebUIContext, parseContextFromWebPage } from './utils';

const debug = getDebug('web-integration');

/**
 * Metadata about the AI task execution
 */
export interface AITaskMetadata {
  /** Status of the task (pending, running, finished, failed, cancelled) */
  status?: string;
  /** Timestamp when the task started */
  start?: number;
  /** Timestamp when the task ended */
  end?: number;
  /** Total time taken to execute the task in milliseconds */
  totalTime?: number;
  /** Cache information */
  cache?: { hit: boolean };
  /** Token usage information */
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    [key: string]: any;
  };
  /** AI's thought process */
  thought?: string;
  /** Element location information */
  locate?: any;
  /** Action plans */
  plan?: any;
  /** Planning information */
  planning?: {
    type: string;
    description: string;
    steps: string[];
  };
  /** Insight information */
  insight?: {
    type: string;
    description: string;
    elements: string[];
  };
  /** Action information */
  action?: {
    type: string;
    description: string;
    result: any;
  };
  /** Action details */
  actionDetails?: Array<{
    type: string;
    subType?: string;
    status: string;
    thought?: string;
  }>;
  /** Task details */
  tasks?: Array<{
    type: string;
    subType?: string;
    status: string;
    thought?: string;
    locate?: any;
    timing?: any;
    usage?: any;
    cache?: any;
    error?: string;
  }>;
}

/**
 * Result of an AI task with metadata
 */
export interface AITaskResult<T = any> {
  /** The actual result of the operation */
  result: T;
  /** Metadata about the task execution */
  metadata: AITaskMetadata;
}

export interface PageAgentOpt {
  forceSameTabNavigation?: boolean /* if limit the new tab to the current page, default true */;
  testId?: string;
  cacheId?: string;
  cachePath?: string; /* custom path for cache files */
  groupName?: string;
  groupDescription?: string;
  cache?: AiTaskCache;
  /* if auto generate report, default false */
  generateReport?: boolean;
  /* if auto print report msg, default false */
  autoPrintReportMsg?: boolean;
  onTaskStartTip?: OnTaskStartTip;
  aiActionContext?: string;
  waitForNavigationTimeout?: number;
  waitForNetworkIdleTimeout?: number;
}

export class PageAgent<PageType extends WebPage = WebPage> {
  page: PageType;

  insight: Insight<WebElementInfo, WebUIContext>;

  dump: GroupedActionDump;

  reportFile?: string | null;

  reportFileName?: string;

  taskExecutor: PageTaskExecutor;

  opts: PageAgentOpt;

  /**
   * If true, the agent will not perform any actions
   */
  dryMode = false;

  onTaskStartTip?: OnTaskStartTip;

  constructor(page: PageType, opts?: PageAgentOpt) {
    this.page = page;
    this.opts = Object.assign(
      {
        generateReport: false,
        autoPrintReportMsg: false,
        groupName: 'Rafi Report',
        groupDescription: '',
      },
      opts || {},
    );

    if (
      this.page.pageType === 'puppeteer' ||
      this.page.pageType === 'playwright'
    ) {
      (this.page as PuppeteerWebPage).waitForNavigationTimeout =
        this.opts.waitForNavigationTimeout ||
        DEFAULT_WAIT_FOR_NAVIGATION_TIMEOUT;
      (this.page as PuppeteerWebPage).waitForNetworkIdleTimeout =
        this.opts.waitForNetworkIdleTimeout ||
        DEFAULT_WAIT_FOR_NETWORK_IDLE_TIMEOUT;
    }

    this.onTaskStartTip = this.opts.onTaskStartTip;
    // get the parent browser of the puppeteer page
    // const browser = (this.page as PuppeteerWebPage).browser();

    this.insight = new Insight<WebElementInfo, WebUIContext>(
      async (action: InsightAction) => {
        return this.getUIContext(action);
      },
    );

    this.taskExecutor = new PageTaskExecutor(this.page, this.insight, {
      cacheId: opts?.cacheId,
      onTaskStart: this.callbackOnTaskStartTip.bind(this),
    });
    this.dump = this.resetDump();
    this.reportFileName = reportFileName(
      opts?.testId || this.page.pageType || 'web',
    );
  }

  async getUIContext(action?: InsightAction): Promise<WebUIContext> {
    if (action && (action === 'extract' || action === 'assert')) {
      return await parseContextFromWebPage(this.page, {
        ignoreMarker: true,
      });
    }
    return await parseContextFromWebPage(this.page, {
      ignoreMarker: !!vlLocateMode(),
    });
  }

  async setAIActionContext(prompt: string) {
    this.opts.aiActionContext = prompt;
  }

  resetDump() {
    this.dump = {
      groupName: this.opts.groupName!,
      groupDescription: this.opts.groupDescription,
      executions: [],
    };

    return this.dump;
  }

  appendExecutionDump(execution: ExecutionDump) {
    // For Puppeteer, we'll keep minimal data to avoid memory issues
    if (this.page.pageType === 'puppeteer') {
      // Only keep essential data for metadata extraction
      const minimalExecution = {
        ...execution,
        // Remove large screenshot data if present
        tasks: execution.tasks.map(task => ({
          ...task,
          recorder: undefined // Remove screenshots and other large data
        }))
      };
      this.dump.executions.push(minimalExecution);
    } else {
      // For other page types, keep all data
      this.dump.executions.push(execution);
    }
  }

  dumpDataString() {
    // update dump info
    this.dump.groupName = this.opts.groupName!;
    this.dump.groupDescription = this.opts.groupDescription;
    return stringifyDumpData(this.dump);
  }

  reportHTMLString() {
    return reportHTMLContent(this.dumpDataString());
  }

  writeOutActionDumps() {
    // Deactivated report generation for Puppeteer
    if (this.page.pageType !== 'puppeteer') {
      const { generateReport, autoPrintReportMsg } = this.opts;
      this.reportFile = writeLogFile({
        fileName: this.reportFileName!,
        fileExt: groupedActionDumpFileExt,
        fileContent: this.dumpDataString(),
        type: 'dump',
        generateReport,
      });
      debug('writeOutActionDumps', this.reportFile);
      if (generateReport && autoPrintReportMsg && this.reportFile) {
        printReportMsg(this.reportFile);
      }
    }
    // For Puppeteer, we just skip report generation but keep the metadata
  }

  private async callbackOnTaskStartTip(task: ExecutionTask) {
    const param = paramStr(task);
    const tip = param ? `${typeStr(task)} - ${param}` : typeStr(task);
    if (this.onTaskStartTip) {
      await this.onTaskStartTip(tip);
    }
  }

  private afterTaskRunning(executor: Executor, doNotThrowError = false) {
    // Always collect execution data for metadata
    this.appendExecutionDump(executor.dump());

    // Only write out dumps if not using Puppeteer
    this.writeOutActionDumps();

    if (executor.isInErrorState() && !doNotThrowError) {
      const errorTask = executor.latestErrorTask();
      throw new Error(`${errorTask?.error}`);
    }

    // Extract metadata from the executor
    const lastTask = executor.tasks[executor.tasks.length - 1];

    // Collect all tasks' thoughts and plans
    const allThoughts = executor.tasks
      .filter(task => task.thought)
      .map(task => task.thought);

    // Collect all locate information
    const allLocates = executor.tasks
      .filter(task => task.locate)
      .map(task => task.locate);

    // Collect all plans
    const allPlans = executor.tasks
      .filter(task => task.param?.plans)
      .map(task => task.param?.plans);

    // Collect tasks by type
    const planningTasks = executor.tasks.filter(task => task.type === 'Planning');
    const insightTasks = executor.tasks.filter(task => task.type === 'Insight');
    const actionTasks = executor.tasks.filter(task => task.type === 'Action');

    // Create planning, insight, and action information
    const planning = planningTasks.length > 0 ? {
      type: "Planning",
      description: `Planning for task execution`,
      steps: planningTasks.map(task => task.thought || 'Planning step')
    } : undefined;

    const insight = insightTasks.length > 0 ? {
      type: "Insight",
      description: `Insight for task execution`,
      elements: insightTasks.map(task => task.thought || 'Insight element')
    } : undefined;

    const action = actionTasks.length > 0 ? {
      type: "Action",
      description: `Action for task execution`,
      result: lastTask?.output
    } : undefined;

    // Create action details
    const actionDetails = executor.tasks.map(task => ({
      type: task.type,
      subType: task.subType,
      status: task.status,
      thought: task.thought
    }));

    // Extract detailed information from all tasks
    const metadata = {
      status: lastTask?.status,
      start: lastTask?.timing?.start,
      end: lastTask?.timing?.end,
      totalTime: lastTask?.timing?.cost,
      cache: lastTask?.cache,
      usage: lastTask?.usage,
      thought: allThoughts.length > 0 ? allThoughts.join('\n') : lastTask?.thought,
      locate: allLocates.length > 0 ? allLocates : lastTask?.locate,
      plan: allPlans.length > 0 ? allPlans : lastTask?.param?.plans,
      // Add planning, insight, and action information
      planning,
      insight,
      action,
      actionDetails,
      // Include raw tasks for debugging
      tasks: executor.tasks.map(task => ({
        type: task.type,
        subType: task.subType,
        status: task.status,
        thought: task.thought,
        locate: task.locate,
        timing: task.timing,
        usage: task.usage,
        cache: task.cache,
        error: task.error
      }))
    };

    return metadata;
  }

  private buildDetailedLocateParam(locatePrompt: string, opt?: LocateOption) {
    assert(locatePrompt, 'missing locate prompt');
    if (typeof opt === 'object') {
      return {
        prompt: locatePrompt,
        ...opt,
      };
    }
    return {
      prompt: locatePrompt,
    };
  }

  async aiTap(locatePrompt: string, opt?: LocateOption): Promise<AITaskResult> {
    const detailedLocateParam = this.buildDetailedLocateParam(
      locatePrompt,
      opt,
    );
    const plans = buildPlans('Tap', detailedLocateParam);
    const { executor, output } = await this.taskExecutor.runPlans(
      taskTitleStr('Tap', locateParamStr(detailedLocateParam)),
      plans,
    );
    const metadata = this.afterTaskRunning(executor);
    return {
      result: output,
      metadata
    };
  }

  async aiHover(locatePrompt: string, opt?: LocateOption): Promise<AITaskResult> {
    const detailedLocateParam = this.buildDetailedLocateParam(
      locatePrompt,
      opt,
    );
    const plans = buildPlans('Hover', detailedLocateParam);
    const { executor, output } = await this.taskExecutor.runPlans(
      taskTitleStr('Hover', locateParamStr(detailedLocateParam)),
      plans,
    );
    const metadata = this.afterTaskRunning(executor);
    return {
      result: output,
      metadata
    };
  }

  async aiInput(value: string, locatePrompt: string, opt?: LocateOption): Promise<AITaskResult> {
    assert(
      typeof value === 'string',
      'input value must be a string, use empty string if you want to clear the input',
    );
    assert(locatePrompt, 'missing locate prompt for input');
    const detailedLocateParam = this.buildDetailedLocateParam(
      locatePrompt,
      opt,
    );
    const plans = buildPlans('Input', detailedLocateParam, {
      value,
    });
    const { executor, output } = await this.taskExecutor.runPlans(
      taskTitleStr('Input', locateParamStr(detailedLocateParam)),
      plans,
    );
    const metadata = this.afterTaskRunning(executor);
    return {
      result: output,
      metadata
    };
  }

  async aiKeyboardPress(
    keyName: string,
    locatePrompt?: string,
    opt?: LocateOption,
  ): Promise<AITaskResult> {
    assert(keyName, 'missing keyName for keyboard press');
    const detailedLocateParam = locatePrompt
      ? this.buildDetailedLocateParam(locatePrompt, opt)
      : undefined;
    const plans = buildPlans('KeyboardPress', detailedLocateParam, {
      value: keyName,
    });
    const { executor, output } = await this.taskExecutor.runPlans(
      taskTitleStr('KeyboardPress', locateParamStr(detailedLocateParam)),
      plans,
    );
    const metadata = this.afterTaskRunning(executor);
    return {
      result: output,
      metadata
    };
  }

  async aiScroll(
    scrollParam: PlanningActionParamScroll,
    locatePrompt?: string,
    opt?: LocateOption,
  ): Promise<AITaskResult> {
    const detailedLocateParam = locatePrompt
      ? this.buildDetailedLocateParam(locatePrompt, opt)
      : undefined;
    const plans = buildPlans('Scroll', detailedLocateParam, scrollParam);
    const paramInTitle = locatePrompt
      ? `${locateParamStr(detailedLocateParam)} - ${scrollParamStr(scrollParam)}`
      : scrollParamStr(scrollParam);
    const { executor, output } = await this.taskExecutor.runPlans(
      taskTitleStr('Scroll', paramInTitle),
      plans,
    );
    const metadata = this.afterTaskRunning(executor);
    return {
      result: output,
      metadata
    };
  }

  async aiAction(taskPrompt: string): Promise<AITaskResult> {
    const { output, executor } = await (vlLocateMode() === 'vlm-ui-tars'
      ? this.taskExecutor.actionToGoal(taskPrompt)
      : this.taskExecutor.action(taskPrompt, this.opts.aiActionContext));

    const metadata = this.afterTaskRunning(executor);
    return {
      result: output,
      metadata
    };
  }

  async aiQuery(demand: any): Promise<AITaskResult> {
    const { output, executor } = await this.taskExecutor.query(demand);
    const metadata = this.afterTaskRunning(executor);
    return {
      result: output,
      metadata
    };
  }

  async aiAssert(assertion: string, msg?: string, opt?: AgentAssertOpt): Promise<AITaskResult> {
    const { output, executor } = await this.taskExecutor.assert(assertion);
    const metadata = this.afterTaskRunning(executor, true);

    if (output && opt?.keepRawResponse) {
      return {
        result: output,
        metadata
      };
    }

    if (!output?.pass) {
      const errMsg = msg || `Assertion failed: ${assertion}`;
      const reasonMsg = `Reason: ${
        output?.thought || executor.latestErrorTask()?.error || '(no_reason)'
      }`;
      throw new Error(`${errMsg}\n${reasonMsg}`);
    }

    return {
      result: output,
      metadata
    };
  }

  async aiWaitFor(assertion: string, opt?: AgentWaitForOpt): Promise<AITaskResult> {
    const { executor } = await this.taskExecutor.waitFor(assertion, {
      timeoutMs: opt?.timeoutMs || 15 * 1000,
      checkIntervalMs: opt?.checkIntervalMs || 3 * 1000,
      assertion,
    });

    // Use the common afterTaskRunning method to extract metadata
    const metadata = this.afterTaskRunning(executor, true);

    return {
      result: true,
      metadata
    };
  }

  async ai(taskPrompt: string, type = 'action'): Promise<AITaskResult> {
    if (type === 'action') {
      return this.aiAction(taskPrompt);
    }
    if (type === 'query') {
      return this.aiQuery(taskPrompt);
    }

    if (type === 'assert') {
      return this.aiAssert(taskPrompt);
    }

    if (type === 'tap') {
      return this.aiTap(taskPrompt);
    }

    throw new Error(
      `Unknown type: ${type}, only support 'action', 'query', 'assert', 'tap'`,
    );
  }

  async runYaml(yamlScriptContent: string): Promise<{
    result: Record<string, any>;
  }> {
    const script = parseYamlScript(yamlScriptContent, 'yaml', true);
    const player = new ScriptPlayer(script, async (_target) => {
      return { agent: this, freeFn: [] };
    });
    await player.run();

    if (player.status === 'error') {
      const errors = player.taskStatusList
        .filter((task) => task.status === 'error')
        .map((task) => {
          return `task - ${task.name}: ${task.error?.message}`;
        })
        .join('\n');
      throw new Error(`Error(s) occurred in running yaml script:\n${errors}`);
    }

    return {
      result: player.result,
    };
  }

  async evaluateJavaScript<T = any>(script: string): Promise<T> {
    assert(
      typeof this.page.evaluateJavaScript === 'function',
      'evaluateJavaScript is not supported in current agent',
    );
    // Type assertion to ensure TypeScript knows the function exists
    return (this.page.evaluateJavaScript as (script: string) => Promise<T>)(script);
  }

  async destroy() {
    await this.page.destroy();
  }
}
