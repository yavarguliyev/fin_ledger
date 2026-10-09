variable "name_prefix" {
  description = "Prefix for resource names, for example ddd-local."
  type        = string
}

variable "payment_providers" {
  description = "Payment providers that get a webhook route; anything else is rejected at the gateway."
  type        = list(string)
}

variable "signature_headers" {
  description = "Request headers copied into message attributes so the worker can verify signatures."
  type        = list(string)
}

variable "provider_attribute" {
  description = "Message attribute that carries the provider name."
  type        = string
  default     = "provider"
}

variable "route_prefix" {
  description = "First path segment of the webhook routes."
  type        = string
  default     = "webhooks"
}

variable "stage_name" {
  description = "API Gateway stage name."
  type        = string
  default     = "v1"
}

variable "queue_name" {
  description = "Queue name without the prefix."
  type        = string
  default     = "webhooks"
}

variable "dead_letter_suffix" {
  description = "Suffix of the dead-letter queue."
  type        = string
  default     = "dlq"
}

variable "max_receive_count" {
  description = "Deliveries before a webhook moves to the dead-letter queue."
  type        = number
  default     = 4
}

variable "visibility_timeout_seconds" {
  description = "How long a received webhook stays hidden before it is delivered again."
  type        = number
  default     = 30
}

variable "receive_wait_seconds" {
  description = "Long-polling wait for each receive."
  type        = number
  default     = 20
}

variable "message_retention_seconds" {
  description = "How long an unprocessed webhook is kept; providers retry for up to 3 days."
  type        = number
  default     = 345600
}

variable "dead_letter_retention_seconds" {
  description = "How long a dead-lettered webhook is kept for replay."
  type        = number
  default     = 1209600
}

variable "kms_data_key_reuse_seconds" {
  description = "How long SQS reuses a data key before asking KMS again."
  type        = number
  default     = 300
}

variable "throttling_burst_limit" {
  description = "Requests the gateway accepts in a burst."
  type        = number
  default     = 100
}

variable "throttling_rate_limit" {
  description = "Steady-state requests per second the gateway accepts."
  type        = number
  default     = 50
}

variable "key_deletion_window_days" {
  description = "Days KMS waits before deleting the key after it is scheduled for deletion."
  type        = number
  default     = 30
}

variable "consumer_role_names" {
  description = "Roles that consume the webhooks queue."
  type        = list(string)
  default     = []
}

variable "consumer_role_arns" {
  description = "ARNs of the same roles, for the key policy."
  type        = list(string)
  default     = []
}

variable "log_retention_days" {
  description = "Days the gateway access logs are kept."
  type        = number
  default     = 90
}
