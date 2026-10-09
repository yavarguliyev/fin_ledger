variable "name_prefix" {
  description = "Prefix for resource names, for example ddd-local."
  type        = string
}

variable "application" {
  description = "Application whose settings these are, for example core-api."
  type        = string
}

variable "values" {
  description = "Non-secret settings by environment variable name; secrets belong in Secrets Manager."
  type        = map(string)
}

variable "reader_role_names" {
  description = "IAM roles allowed to read the parameters."
  type        = list(string)
}
