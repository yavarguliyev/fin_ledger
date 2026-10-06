output "api_role" {
  description = "Name and ARN of the API role."
  value       = { name = aws_iam_role.api.name, arn = aws_iam_role.api.arn }
}

output "worker_role" {
  description = "Name and ARN of the worker role."
  value       = { name = aws_iam_role.worker.name, arn = aws_iam_role.worker.arn }
}
