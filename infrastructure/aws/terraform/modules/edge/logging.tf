resource "aws_cloudwatch_log_group" "access" {
  name              = "/aws/apigateway/${var.name_prefix}-public"
  retention_in_days = var.log_retention_days
}

data "aws_iam_policy_document" "logs_trust" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "logs" {
  name               = "${var.name_prefix}-apigateway-logs"
  description        = "Lets API Gateway write access logs to CloudWatch Logs."
  assume_role_policy = data.aws_iam_policy_document.logs_trust.json
}

resource "aws_iam_role_policy_attachment" "logs" {
  role       = aws_iam_role.logs.name
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

resource "aws_api_gateway_account" "logging" {
  cloudwatch_role_arn = aws_iam_role.logs.arn

  depends_on = [aws_iam_role_policy_attachment.logs]
}
