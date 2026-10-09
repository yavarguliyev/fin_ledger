output "bucket_name" {
  description = "Bucket that holds the client build."
  value       = aws_s3_bucket.web.bucket
}

output "website_endpoint" {
  description = "S3 website endpoint (local check only; production serves the bucket through CloudFront)."
  value       = aws_s3_bucket_website_configuration.web.website_endpoint
}
