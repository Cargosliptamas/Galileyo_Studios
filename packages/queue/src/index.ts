import type { JobsOptions as BullMQJobsOptions } from "bullmq";
import type { Job as ScheduleJobType } from "node-schedule";
import { Queue, QueueEvents, Worker } from "bullmq";
import { scheduleJob } from "node-schedule";

import type { JobConfig, Job as JobDataType } from "./types.js";

export type { JobConfig, Job } from "./types.js";

export interface QueueOptions {
  enabled: boolean;
  startWorker?: boolean;
  redisOptions: {
    name: string;
    prefix: string;
    host: string;
    port: number;
    username?: string;
    password?: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoggerFunctionArgs = any[];

interface LoggerInterface {
  info: (...args: LoggerFunctionArgs) => void;
  warn: (...args: LoggerFunctionArgs) => void;
  error: (...args: LoggerFunctionArgs) => void;
}

export class QueueModule {
  private initialized: boolean;
  private scheduledJobs: Record<string, ScheduleJobType>;
  private options: QueueOptions;
  private availableJobs: Record<string, JobConfig["options"]>;
  private jobHandles: Record<string, JobConfig>;

  private queue: Queue | null;
  private queueEvents: QueueEvents | null;

  private logger: LoggerInterface;
  private mainLogger: LoggerInterface;

  constructor(options: QueueOptions) {
    this.initialized = false;
    this.scheduledJobs = {};
    this.options = options;

    this.availableJobs = {};

    this.jobHandles = {};

    this.queue = null;
    this.queueEvents = null;

    this.logger = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      info: (...args: LoggerFunctionArgs) => console.log("[Queue]: ", ...args),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      warn: (...args: LoggerFunctionArgs) => console.warn("[Queue]: ", ...args),

      error: (...args: LoggerFunctionArgs) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        console.error("[Queue]: ", ...args),
    };

    this.mainLogger = {
      info: console.log,
      warn: console.warn,
      error: console.error,
    };
  }

  getLogger() {
    return this.logger;
  }

  async init(availableJobs: Record<string, JobConfig>) {
    if (this.initialized) {
      return;
    }

    if (!this.options.enabled) {
      return;
    }

    const redisOptions = this.options.redisOptions;

    this.initialized = true;

    const defaultJobOptions = {
      attempts: 1,
      backoff: { type: "exponential", delay: 5 * 1000 },
      removeOnComplete: true,
      removeOnFail: true,
      timeout: 5 * 60 * 1000,
    };

    const connection = {
      host: redisOptions.host,
      port: redisOptions.port,
      username: redisOptions.username,
      password: redisOptions.password,
    };

    this.queue = new Queue<JobDataType>(redisOptions.name, {
      connection,
      prefix: redisOptions.prefix,
      defaultJobOptions,
    });

    this.queueEvents = new QueueEvents(redisOptions.name, { connection });

    await this.queueEvents.waitUntilReady();

    this._addEvents();

    const workerEnabled = this.options.startWorker ?? true;

    if (!workerEnabled) {
      return;
    }

    await this.listen();

    Object.keys(availableJobs).forEach((name) => {
      const jobConfig = availableJobs[name];

      if (!jobConfig) {
        return;
      }

      try {
        this.jobHandles[name] = jobConfig;
        const jobOptions = this._getProcessor(name).options;

        this.availableJobs[name] = jobOptions;

        this.register(name);
      } catch (error) {
        this.mainLogger.error(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          `Failed to initialize job: ${name}. ${error as any}`,
        );
      }
    });
  }

  destroy() {
    if (!this.initialized) {
      throw new Error("QUEUE_NOT_INITIALIZED");
    }

    this.initialized = false;

    if (!this.options.enabled) {
      return;
    }

    Object.getOwnPropertyNames(this.scheduledJobs).forEach((name) =>
      this.cancelNextInvocations(name),
    );

    this.queue?.eventNames().forEach((event) => {
      this.queue?.removeAllListeners(event);
    });

    return this.queue?.close();
  }

  register(name: string) {
    const message = [`Watching job [${name}]`];

    const scheduleTime = this._schedule(name);

    if (scheduleTime) {
      message.push(`scheduled on [${scheduleTime}]`);
    }

    if (this._startup(name)) {
      message.push("run at startup");
    }

    this.mainLogger.info(`${message.join(" :: ")}.`);
  }

  async add(name: string, data: JobDataType, options?: BullMQJobsOptions) {
    if (!this.options.enabled) {
      this.mainLogger.warn(
        `Queue is disabled, so it cannot add job [${name}] to the queue.`,
      );
      return Promise.resolve();
    }

    if (!this.queue) {
      this.mainLogger.error("Queue is not initialized.");
      return Promise.resolve();
    }

    await this.queue.add(name, data, options);
  }

  cancelNextInvocations(name: string) {
    if (!this.scheduledJobs[name]) {
      return;
    }

    this.scheduledJobs[name].cancel();
    delete this.scheduledJobs[name];
  }

  schedule(name: string, scheduleTime: string) {
    this.availableJobs[name] = { scheduleTime };

    this.cancelNextInvocations(name);
    this._schedule(name);

    this.mainLogger.info(`Job [${name}] is scheduled on [${scheduleTime}].`);
  }

  setConcurrency(concurrency: number) {
    if (!this.queue) {
      this.mainLogger.error("Queue is not initialized.");
      return;
    }

    void this.queue.setGlobalConcurrency(concurrency);
  }

  private _getProcessor(name: string) {
    if (!this.jobHandles[name]) {
      throw new Error(`Job with name(${name}) not found.`);
    }

    return this.jobHandles[name];
  }

  private _isEnabled(name: string, property: keyof JobConfig["options"]) {
    const job = this.availableJobs[name];

    return job?.[property];
  }

  private _schedule(name: string) {
    const scheduleTime = this._isEnabled(name, "scheduleTime");

    if (!scheduleTime) {
      return "";
    }

    this.scheduledJobs[name] = scheduleJob(
      `scheduled-job-${name}`,
      String(scheduleTime),
      async () => {
        await this.add(name, {});
      },
    );

    return scheduleTime;
  }

  private _startup(name: string) {
    if (!this._isEnabled(name, "startup")) {
      return false;
    }

    void this.add(name, {});

    return true;
  }

  async listen() {
    const worker = new Worker<JobDataType>(
      this.options.redisOptions.name,
      async (job) => {
        this.logger.info(`Starting job [${job.name} / ${job.id}].`);

        await this._getProcessor(job.name)
          .process(job.data)
          .then(() => {
            this.logger.info(`Finished job [${job.name} / ${job.id}].`);
          });
      },
      {
        connection: this.options.redisOptions,
        prefix: this.options.redisOptions.prefix,
      },
    );

    worker.on("error", (err) => {
      this.logger.error(err);
    });

    worker.on("failed", (job, err) => {
      this.logger.error(
        `Error happened during job [${job?.name} / ${job?.id}] processing. %o`,
        job?.stacktrace[0] ?? {
          data: job?.data,
          stack: job?.stacktrace,
          error: err,
        },
      );
    });

    await worker.waitUntilReady();
  }

  private _addEvents() {
    this.queue?.on("error", (error) => {
      this.logger.error("Error happened during queue processing %o", error);
    });

    this.queueEvents?.on("stalled", (job) => {
      this.logger.warn(`Job [${job.jobId}] has been marked as stalled.`);
    });

    this.queueEvents?.on("failed", (job, error) => {
      this.logger.error(`Error happened during job: ${job.jobId}: ${error}`);
      this.logger.error(job.failedReason);
    });
  }
}
