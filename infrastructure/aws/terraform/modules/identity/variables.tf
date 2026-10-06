variable "name_prefix" {
  description = "Prefix for resource names, for example ddd-local."
  type        = string
}

variable "workload_service" {
  description = "AWS service that runs the API and worker and may assume their roles."
  type        = string
  default     = "ecs-tasks.amazonaws.com"
}

variable "max_session_seconds" {
  description = "Longest session a role grants."
  type        = number
  default     = 3600
}
