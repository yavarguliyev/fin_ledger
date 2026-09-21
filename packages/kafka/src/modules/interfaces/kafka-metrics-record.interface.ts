export interface KafkaMetricsRecord {
  readonly messagesInPerSec: number;
  readonly underReplicatedPartitions: number;
}
