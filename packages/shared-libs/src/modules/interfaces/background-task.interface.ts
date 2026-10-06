export interface BackgroundTask {
  start(): Promise<void> | void;
  stop(): Promise<void> | void;
}
