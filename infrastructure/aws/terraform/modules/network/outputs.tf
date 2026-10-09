output "vpc_id" {
  description = "ID of the VPC."
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Subnets for the load balancer."
  value       = [for subnet in aws_subnet.public : subnet.id]
}

output "app_subnet_ids" {
  description = "Private subnets for the API and worker tasks."
  value       = [for subnet in aws_subnet.app : subnet.id]
}

output "data_subnet_ids" {
  description = "Private subnets for PostgreSQL and Redis."
  value       = [for subnet in aws_subnet.data : subnet.id]
}

output "security_group_ids" {
  description = "Security group per tier."
  value = {
    load_balancer = aws_security_group.load_balancer.id
    app           = aws_security_group.app.id
    data          = aws_security_group.data.id
    endpoints     = aws_security_group.endpoints.id
  }
}
