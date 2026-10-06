output "topic_arn" {
  description = "Event topic the outbox relay publishes to."
  value       = aws_sns_topic.events.arn
}

output "queue_names" {
  description = "Queue per event type."
  value       = local.queues
}

output "kms_key_arn" {
  description = "KMS key that encrypts the topic and the queues."
  value       = aws_kms_key.messaging.arn
}
