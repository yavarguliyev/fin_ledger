variable "name_prefix" {
  description = "Prefix for resource names, for example ddd-local."
  type        = string
}

variable "cidr_block" {
  description = "Address range of the VPC."
  type        = string
}

variable "availability_zones" {
  description = "Zones the subnets are spread across; at least two for a highly available setup."
  type        = list(string)
}

variable "subnet_newbits" {
  description = "Bits added to the VPC prefix for each subnet (8 turns a /16 into /24 subnets)."
  type        = number
  default     = 8
}

variable "app_subnet_offset" {
  description = "Index where the app subnets start in the VPC range."
  type        = number
  default     = 10
}

variable "data_subnet_offset" {
  description = "Index where the data subnets start in the VPC range."
  type        = number
  default     = 20
}

variable "app_port" {
  description = "Port the API listens on inside the VPC."
  type        = number
  default     = 3000
}

variable "data_ports" {
  description = "Database ports the app may reach (PostgreSQL, Redis)."
  type        = list(number)
  default     = [5432, 6379]
}

variable "interface_endpoint_services" {
  description = "AWS services reached through interface endpoints instead of the NAT gateway."
  type        = list(string)
  default     = ["sqs", "sns", "secretsmanager", "ssm", "kms", "logs", "sts"]
}

variable "flow_log_retention_days" {
  description = "Days the VPC flow logs are kept."
  type        = number
  default     = 90
}

variable "provider_egress_cidrs" {
  description = "Address ranges the app may reach over HTTPS through the NAT gateway (payment providers); empty denies outbound internet."
  type        = list(string)
  default     = []
}
