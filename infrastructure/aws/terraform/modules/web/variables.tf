variable "name_prefix" {
  description = "Prefix for resource names, for example ddd-local."
  type        = string
}

variable "bucket_name" {
  description = "Bucket that holds the client build."
  type        = string
}

variable "index_document" {
  description = "Entry page; also served for unknown paths so client-side routes work."
  type        = string
  default     = "index.html"
}

variable "old_build_retention_days" {
  description = "Days a replaced file of an older build is kept."
  type        = number
  default     = 30
}

variable "cloudfront_distribution_arn" {
  description = "CloudFront distribution allowed to read the bucket (Origin Access Control); null until one exists."
  type        = string
  default     = null
}

variable "enforce_tls" {
  description = "Deny requests that are not made over HTTPS."
  type        = bool
}

variable "key_deletion_window_days" {
  description = "Days KMS waits before deleting the key after it is scheduled for deletion."
  type        = number
  default     = 30
}
