export interface KafkaSubscriberMetadataRecord {
  readonly methodName: string | symbol;
  readonly options: { readonly topic: string | RegExp; readonly fromBeginning?: boolean };
}
