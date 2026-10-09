data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

data "aws_region" "current" {}

locals {
  path     = "/${var.name_prefix}/${var.application}"
  path_arn = "arn:${data.aws_partition.current.partition}:ssm:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:parameter${local.path}"
}

resource "aws_ssm_parameter" "app" {
  for_each = var.values

  name        = "${local.path}/${each.key}"
  description = "Non-secret runtime setting of ${var.application}."
  type        = "String"
  value       = each.value
}

data "aws_iam_policy_document" "read" {
  statement {
    sid       = "ReadApplicationParameters"
    actions   = ["ssm:GetParametersByPath", "ssm:GetParameters", "ssm:GetParameter"]
    resources = [local.path_arn, "${local.path_arn}/*"]
  }
}

resource "aws_iam_policy" "read" {
  name        = "${var.name_prefix}-parameters-read"
  description = "Read the application's own parameters and nothing else."
  policy      = data.aws_iam_policy_document.read.json
}

resource "aws_iam_role_policy_attachment" "read" {
  for_each = toset(var.reader_role_names)

  role       = each.value
  policy_arn = aws_iam_policy.read.arn
}
