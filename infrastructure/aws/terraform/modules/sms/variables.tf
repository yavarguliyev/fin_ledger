variable "name_prefix" {
  description = "Prefix for resource names, for example ddd-local."
  type        = string
}

variable "monthly_spend_limit" {
  description = "Account-wide monthly SMS spend limit in USD; SNS stops sending once it is reached."
  type        = number
}

variable "default_sms_type" {
  description = "Transactional (OTP codes, alerts) or Promotional."
  type        = string
  default     = "Transactional"
}

variable "default_sender_id" {
  description = "Alphanumeric sender ID shown to recipients where the country supports it (1 to 11 characters)."
  type        = string
}

variable "sender_role_names" {
  description = "IAM roles allowed to send SMS."
  type        = list(string)
  default     = []
}
