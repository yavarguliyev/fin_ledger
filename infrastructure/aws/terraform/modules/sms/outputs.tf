output "monthly_spend_limit" {
  description = "Account-wide monthly SMS spend limit in USD."
  value       = aws_sns_sms_preferences.account.monthly_spend_limit
}

output "send_policy_arn" {
  description = "Policy that lets a role send SMS to phone numbers only."
  value       = aws_iam_policy.send.arn
}
