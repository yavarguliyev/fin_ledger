variable "project" {
  description = "Short project name used as the prefix of every resource name."
  type        = string
}

variable "environment" {
  description = "Deployment environment, for example local, staging or production."
  type        = string
}

variable "region" {
  description = "AWS region."
  type        = string
}

variable "localstack_endpoint" {
  description = "LocalStack edge URL. Leave null to target real AWS."
  type        = string
  default     = null
}

variable "localstack_credentials" {
  description = "Dummy credentials LocalStack accepts. Ignored against real AWS."
  type = object({
    access_key = string
    secret_key = string
  })
  default = {
    access_key = "test"
    secret_key = "test"
  }
}

variable "storage_bucket_name" {
  description = "Bucket for profile images and chat attachments (STORAGE_BUCKET_NAME in the API)."
  type        = string
}

variable "email_sender" {
  description = "Address the API sends e-mail from (EMAIL_FROM in the API)."
  type        = string
}

variable "storage_object_prefixes" {
  description = "Key prefixes the API writes under (user- for profile images, support/ for chat files)."
  type        = list(string)
}

variable "enforce_tls" {
  description = "Refuse plain-HTTP requests to the bucket. Must be true on real AWS."
  type        = bool
  default     = true
}

variable "key_deletion_window_days" {
  description = "Days KMS keys wait before deletion once scheduled."
  type        = number
  default     = 30
}

variable "secrets_application" {
  description = "Application whose runtime secrets are kept in Secrets Manager."
  type        = string
  default     = "core-api"
}

variable "secret_recovery_window_days" {
  description = "Days a deleted secret can still be restored (7 to 30 on AWS)."
  type        = number
  default     = 30
}

variable "messaging_topic_name" {
  description = "Event topic name without the prefix; mirrors the RabbitMQ exchange."
  type        = string
  default     = "wallet-events"
}

variable "messaging_queue_prefix" {
  description = "Queue name prefix used by the application's consumers."
  type        = string
  default     = "notifications"
}

variable "messaging_routing_keys" {
  description = "Event types with a consumer; keep in sync with the notification consumers."
  type        = list(string)
}

variable "sms_monthly_spend_limit" {
  description = "Account-wide monthly SMS spend limit in USD."
  type        = number
  default     = 1
}

variable "sms_sender_id" {
  description = "Alphanumeric SMS sender ID (1 to 11 characters)."
  type        = string
  default     = "WALLET"
}
