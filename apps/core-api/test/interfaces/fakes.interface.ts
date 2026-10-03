export interface KafkaMessageFakeDto {
  key: Buffer;
  value: Buffer;
  timestamp: string;
  offset: string;
  headers: Record<string, Buffer>;
}

export interface ConfigFakeDto {
  values: Record<string, string>;
}

export interface ResponseRef {
  response: Response;
}
