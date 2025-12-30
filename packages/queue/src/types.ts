/* eslint-disable @typescript-eslint/no-explicit-any */

export type AnyObject = Record<string, any>;

export type Job<T = AnyObject> = T;

export type JobFunction<T = AnyObject> = (job: Job<T>) => Promise<void>;
export interface JobConfig<T = Record<string, any>> {
  options: {
    scheduleTime?: string;
    startup?: boolean;
  };
  process: JobFunction<T>;
}
