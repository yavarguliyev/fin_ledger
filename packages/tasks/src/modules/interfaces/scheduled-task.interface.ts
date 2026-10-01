export interface ScheduledTask {
  name: string;
  everyMs: number;

  run: () => Promise<void>;
}
