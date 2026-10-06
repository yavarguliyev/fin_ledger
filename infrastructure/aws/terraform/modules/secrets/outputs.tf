output "secret_name" {
  description = "Name of the application secret."
  value       = aws_secretsmanager_secret.app.name
}

output "secret_arn" {
  description = "ARN of the application secret."
  value       = aws_secretsmanager_secret.app.arn
}

output "kms_key_arn" {
  description = "KMS key that encrypts the secret."
  value       = aws_kms_key.secrets.arn
}
