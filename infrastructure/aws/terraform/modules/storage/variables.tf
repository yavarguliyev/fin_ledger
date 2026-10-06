variable "name_prefix" {
  description = "Prefix for resource names, for example ddd-local."
  type        = string
}

variable "bucket_name" {
  description = "Name of the file bucket."
  type        = string
}

variable "object_prefixes" {
  description = "Key prefixes the application writes under; access is limited to these."
  type        = list(string)
}

variable "access_role_names" {
  description = "IAM roles that may use the bucket."
  type        = list(string)
  default     = []
}

variable "access_principal_arns" {
  description = "ARNs of every role and user that may use the storage key."
  type        = list(string)
}

variable "enforce_tls" {
  description = "Refuse requests that are not made over HTTPS. LocalStack serves plain HTTP, so local runs turn this off."
  type        = bool
  default     = true
}

variable "key_deletion_window_days" {
  description = "Days KMS waits before deleting the key after it is scheduled for deletion."
  type        = number
  default     = 30
}

variable "noncurrent_version_days" {
  description = "Days an overwritten or deleted file version is kept before it expires."
  type        = number
  default     = 30
}

variable "multipart_abort_days" {
  description = "Days before an unfinished multipart upload is cleaned up."
  type        = number
  default     = 7
}

variable "log_retention_days" {
  description = "Days access logs are kept."
  type        = number
  default     = 90
}

variable "log_prefix" {
  description = "Prefix the access logs are written under."
  type        = string
  default     = "s3-access/files/"
}
