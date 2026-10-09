output "rest_api_id" {
  description = "ID of the public REST API."
  value       = aws_api_gateway_rest_api.public.id
}

output "stage_name" {
  description = "Stage the routes are deployed to."
  value       = aws_api_gateway_stage.public.stage_name
}

output "queue_name" {
  description = "Queue the webhooks land in."
  value       = aws_sqs_queue.webhooks.name
}
