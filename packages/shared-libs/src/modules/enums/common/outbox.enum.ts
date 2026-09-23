export enum OutboxStatus {
  DEAD = 'DEAD',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED'
}

export enum OutboxDestination {
  KAFKA = 'KAFKA',
  RABBITMQ = 'RABBITMQ'
}
