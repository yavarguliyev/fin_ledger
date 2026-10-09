data "aws_partition" "current" {}

resource "aws_sns_sms_preferences" "account" {
  monthly_spend_limit = var.monthly_spend_limit
  default_sms_type    = var.default_sms_type
  default_sender_id   = var.default_sender_id
}

data "aws_iam_policy_document" "send" {
  statement {
    sid       = "SendSmsToPhoneNumbers"
    actions   = ["sns:Publish"]
    resources = ["*"]
  }

  statement {
    sid       = "DenyPublishingToTopics"
    effect    = "Deny"
    actions   = ["sns:Publish"]
    resources = ["arn:${data.aws_partition.current.partition}:sns:*:*:*"]
  }
}

resource "aws_iam_policy" "send" {
  name        = "${var.name_prefix}-sms-send"
  description = "Send SMS to phone numbers only; publishing to any topic is denied."
  policy      = data.aws_iam_policy_document.send.json
}

resource "aws_iam_role_policy_attachment" "send" {
  for_each = toset(var.sender_role_names)

  role       = each.value
  policy_arn = aws_iam_policy.send.arn
}
