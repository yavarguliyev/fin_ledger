locals {
  proxy_enabled = var.api_upstream_url != null
}

resource "aws_api_gateway_resource" "api" {
  count = local.proxy_enabled ? 1 : 0

  rest_api_id = aws_api_gateway_rest_api.public.id
  parent_id   = aws_api_gateway_rest_api.public.root_resource_id
  path_part   = var.api_route_prefix
}

resource "aws_api_gateway_resource" "api_proxy" {
  count = local.proxy_enabled ? 1 : 0

  rest_api_id = aws_api_gateway_rest_api.public.id
  parent_id   = aws_api_gateway_resource.api[0].id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "api_proxy" {
  count = local.proxy_enabled ? 1 : 0

  rest_api_id   = aws_api_gateway_rest_api.public.id
  resource_id   = aws_api_gateway_resource.api_proxy[0].id
  http_method   = "ANY"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_integration" "api_proxy" {
  count = local.proxy_enabled ? 1 : 0

  rest_api_id             = aws_api_gateway_rest_api.public.id
  resource_id             = aws_api_gateway_resource.api_proxy[0].id
  http_method             = aws_api_gateway_method.api_proxy[0].http_method
  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "${var.api_upstream_url}/${var.api_route_prefix}/{proxy}"
  timeout_milliseconds    = var.api_timeout_milliseconds

  request_parameters = {
    "integration.request.path.proxy" = "method.request.path.proxy"
  }
}
