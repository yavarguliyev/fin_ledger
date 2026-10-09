locals {
  attribute_offset = 2
  header_attributes = join("", [
    for index, header in var.signature_headers :
    "#if($input.params('${header}') != \"\")&MessageAttribute.${index + local.attribute_offset}.Name=${header}&MessageAttribute.${index + local.attribute_offset}.Value.DataType=String&MessageAttribute.${index + local.attribute_offset}.Value.StringValue=$util.urlEncode($input.params('${header}'))#end"
  ])
  send_message = {
    for provider in var.payment_providers :
    provider => "Action=SendMessage&MessageBody=$util.urlEncode($input.body)&MessageAttribute.1.Name=${var.provider_attribute}&MessageAttribute.1.Value.DataType=String&MessageAttribute.1.Value.StringValue=${provider}${local.header_attributes}"
  }
}

resource "aws_api_gateway_rest_api" "public" {
  name        = "${var.name_prefix}-public"
  description = "Public entry point: /api/* is proxied to the API, webhooks are queued before the application sees them."

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "webhooks" {
  rest_api_id = aws_api_gateway_rest_api.public.id
  parent_id   = aws_api_gateway_rest_api.public.root_resource_id
  path_part   = var.route_prefix
}

resource "aws_api_gateway_resource" "provider" {
  for_each = toset(var.payment_providers)

  rest_api_id = aws_api_gateway_rest_api.public.id
  parent_id   = aws_api_gateway_resource.webhooks.id
  path_part   = each.value
}

resource "aws_api_gateway_method" "receive" {
  for_each = toset(var.payment_providers)

  rest_api_id   = aws_api_gateway_rest_api.public.id
  resource_id   = aws_api_gateway_resource.provider[each.value].id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "enqueue" {
  for_each = toset(var.payment_providers)

  rest_api_id             = aws_api_gateway_rest_api.public.id
  resource_id             = aws_api_gateway_resource.provider[each.value].id
  http_method             = aws_api_gateway_method.receive[each.value].http_method
  type                    = "AWS"
  integration_http_method = "POST"
  uri                     = "arn:${data.aws_partition.current.partition}:apigateway:${local.region}:sqs:path/${local.account_id}/${aws_sqs_queue.webhooks.name}"
  credentials             = aws_iam_role.gateway.arn
  passthrough_behavior    = "NEVER"

  request_parameters = {
    "integration.request.header.Content-Type" = "'application/x-www-form-urlencoded'"
  }

  request_templates = {
    "application/json" = local.send_message[each.value]
  }
}

resource "aws_api_gateway_method_response" "accepted" {
  for_each = toset(var.payment_providers)

  rest_api_id = aws_api_gateway_rest_api.public.id
  resource_id = aws_api_gateway_resource.provider[each.value].id
  http_method = aws_api_gateway_method.receive[each.value].http_method
  status_code = "200"
}

resource "aws_api_gateway_integration_response" "accepted" {
  for_each = toset(var.payment_providers)

  rest_api_id = aws_api_gateway_rest_api.public.id
  resource_id = aws_api_gateway_resource.provider[each.value].id
  http_method = aws_api_gateway_method.receive[each.value].http_method
  status_code = aws_api_gateway_method_response.accepted[each.value].status_code

  response_templates = {
    "application/json" = jsonencode({ received = true })
  }

  depends_on = [aws_api_gateway_integration.enqueue]
}

resource "aws_api_gateway_deployment" "public" {
  rest_api_id = aws_api_gateway_rest_api.public.id

  triggers = {
    redeployment = sha1(jsonencode([local.send_message, var.payment_providers, var.api_upstream_url, var.api_route_prefix]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [aws_api_gateway_integration_response.accepted, aws_api_gateway_integration.api_proxy]
}

resource "aws_api_gateway_stage" "public" {
  rest_api_id   = aws_api_gateway_rest_api.public.id
  deployment_id = aws_api_gateway_deployment.public.id
  stage_name    = var.stage_name

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.access.arn
    format = jsonencode({
      requestId = "$context.requestId"
      ip        = "$context.identity.sourceIp"
      method    = "$context.httpMethod"
      path      = "$context.resourcePath"
      status    = "$context.status"
      latencyMs = "$context.responseLatency"
      at        = "$context.requestTime"
    })
  }

  depends_on = [aws_api_gateway_account.logging]
}

resource "aws_api_gateway_method_settings" "throttle" {
  rest_api_id = aws_api_gateway_rest_api.public.id
  stage_name  = aws_api_gateway_stage.public.stage_name
  method_path = "*/*"

  settings {
    throttling_burst_limit = var.throttling_burst_limit
    throttling_rate_limit  = var.throttling_rate_limit
  }
}
