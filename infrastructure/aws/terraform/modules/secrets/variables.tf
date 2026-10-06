variable "name_prefix" {
  description = "Prefix for resource names, for example ddd-local."
  type        = string
}

variable "application" {
  description = "Application whose secrets this holds, for example core-api."
  type        = string
}

variable "reader_role_names" {
  description = "IAM roles allowed to read the secret."
  type        = list(string)
}

variable "reader_role_arns" {
  description = "ARNs of the same roles, for the key and secret policies."
  type        = list(string)
}

variable "key_deletion_window_days" {
  description = "Days KMS waits before deleting the key after it is scheduled for deletion."
  type        = number
  default     = 30
}

variable "recovery_window_days" {
  description = "Days a deleted secret can still be restored."
  type        = number
  default     = 30
}
