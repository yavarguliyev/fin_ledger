variable "name_prefix" {
  description = "Prefix for resource names, for example ddd-local."
  type        = string
}

variable "topic_name" {
  description = "Event topic name without the prefix; the counterpart of the RabbitMQ exchange."
  type        = string
}

variable "queue_prefix" {
  description = "Queue name prefix the application uses, for example notifications."
  type        = string
}

variable "routing_keys" {
  description = "Event types that get a queue; each queue only receives its own event type."
  type        = list(string)
}

variable "routing_key_attribute" {
  description = "Message attribute that carries the event type and drives the subscription filters."
  type        = string
  default     = "routing_key"
}

variable "dead_letter_suffix" {
  description = "Suffix of each dead-letter queue."
  type        = string
  default     = "dlq"
}

variable "max_receive_count" {
  description = "Deliveries before a message moves to its dead-letter queue (first try plus retries)."
  type        = number
  default     = 4
}

variable "visibility_timeout_seconds" {
  description = "How long a received message stays hidden before it is delivered again."
  type        = number
  default     = 30
}

variable "receive_wait_seconds" {
  description = "Long-polling wait for each receive."
  type        = number
  default     = 20
}

variable "message_retention_seconds" {
  description = "How long an unconsumed message is kept."
  type        = number
  default     = 345600
}

variable "dead_letter_retention_seconds" {
  description = "How long a dead-lettered message is kept for inspection and replay."
  type        = number
  default     = 1209600
}

variable "kms_data_key_reuse_seconds" {
  description = "How long SQS reuses a data key before asking KMS again."
  type        = number
  default     = 300
}

variable "enforce_tls" {
  description = "Deny queue requests that are not made over HTTPS."
  type        = bool
}

variable "key_deletion_window_days" {
  description = "Days KMS waits before deleting the key after it is scheduled for deletion."
  type        = number
  default     = 30
}

variable "principal_arns" {
  description = "Roles that may use the messaging key through SNS and SQS."
  type        = list(string)
}

variable "publisher_role_names" {
  description = "Roles that may publish events."
  type        = list(string)
  default     = []
}

variable "consumer_role_names" {
  description = "Roles that may consume, retry and replay."
  type        = list(string)
  default     = []
}

variable "monitor_role_names" {
  description = "Roles that may only read queue depth."
  type        = list(string)
  default     = []
}
