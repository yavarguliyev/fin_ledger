output "identity" {
  description = "Verified SES identity for the sender."
  value       = aws_ses_email_identity.sender.email
}
