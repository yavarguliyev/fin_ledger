output "bucket_name" {
  description = "Name of the file bucket."
  value       = aws_s3_bucket.files.bucket
}

output "kms_key_arn" {
  description = "ARN of the key that encrypts the bucket."
  value       = aws_kms_key.storage.arn
}

output "access_logs_bucket" {
  description = "Bucket that receives the file bucket's access logs."
  value       = aws_s3_bucket.access_logs.bucket
}

output "access_policy_arn" {
  description = "IAM policy granting the application's file access."
  value       = aws_iam_policy.app_access.arn
}
