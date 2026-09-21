export interface KafkaMessageRecord<T = unknown> {
  readonly topic: string;
  readonly timestamp?: string;
  readonly partition?: number;
  readonly methodName?: string | symbol;
  readonly value: T;
  readonly key?: string | Buffer | null;
  readonly headers?: Record<string, string | Buffer | Array<string | Buffer>>;
}
