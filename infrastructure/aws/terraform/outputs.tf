output "storage_bucket" {
  description = "Bucket the API stores files in."
  value       = module.storage.bucket_name
}

output "storage_kms_key_arn" {
  description = "KMS key that encrypts the bucket."
  value       = module.storage.kms_key_arn
}

output "storage_access_logs_bucket" {
  description = "Bucket that receives the file bucket's access logs."
  value       = module.storage.access_logs_bucket
}

output "email_sender_identity" {
  description = "SES identity the worker sends from."
  value       = module.email.identity
}

output "api_role_arn" {
  description = "Role the API runs as on AWS."
  value       = module.identity.api_role.arn
}

output "worker_role_arn" {
  description = "Role the worker runs as on AWS."
  value       = module.identity.worker_role.arn
}

output "secret_name" {
  description = "Secrets Manager secret holding the application's runtime secrets."
  value       = module.secrets.secret_name
}

output "secrets_kms_key_arn" {
  description = "KMS key that encrypts the application secret."
  value       = module.secrets.kms_key_arn
}

output "messaging_topic_arn" {
  description = "SNS topic that replaces the RabbitMQ exchange when QUEUE_TRANSPORT=sqs."
  value       = module.messaging.topic_arn
}

output "messaging_queues" {
  description = "SQS queue per event type."
  value       = module.messaging.queue_names
}

output "sms_monthly_spend_limit" {
  description = "Monthly SMS spend limit in USD."
  value       = module.sms.monthly_spend_limit
}

output "public_rest_api_id" {
  description = "Public REST API: /api/* to the API, /webhooks/* to the webhooks queue."
  value       = module.edge.rest_api_id
}

output "webhooks_queue" {
  description = "SQS queue the webhooks land in."
  value       = module.edge.queue_name
}
