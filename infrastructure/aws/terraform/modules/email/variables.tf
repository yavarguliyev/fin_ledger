variable "name_prefix" {
  description = "Prefix for resource names, for example ddd-local."
  type        = string
}

variable "sender" {
  description = "E-mail address the application sends from."
  type        = string
}

variable "sender_role_names" {
  description = "IAM roles allowed to send."
  type        = list(string)
  default     = []
}
