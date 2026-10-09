variable "name_prefix" {
  description = "Prefix for resource names, for example ddd-local."
  type        = string
}

variable "dead_letter_queue_names" {
  description = "Dead-letter queues that alert as soon as they hold a message."
  type        = list(string)
}

variable "alert_emails" {
  description = "Addresses subscribed to the alerts topic; each must confirm the subscription e-mail."
  type        = list(string)
  default     = []
}

variable "alarm_period_seconds" {
  description = "Metric period the dead-letter alarms evaluate."
  type        = number
  default     = 60
}

variable "key_deletion_window_days" {
  description = "Days KMS waits before deleting the key after it is scheduled for deletion."
  type        = number
  default     = 30
}
