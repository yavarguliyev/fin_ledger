output "topic_arn" {
  description = "SNS topic every alarm notifies."
  value       = aws_sns_topic.alerts.arn
}

output "alarm_names" {
  description = "One alarm per dead-letter queue."
  value       = [for alarm in aws_cloudwatch_metric_alarm.dead_letters : alarm.alarm_name]
}
