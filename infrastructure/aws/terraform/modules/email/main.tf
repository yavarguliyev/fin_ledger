resource "aws_ses_email_identity" "sender" {
  email = var.sender
}

data "aws_iam_policy_document" "send" {
  statement {
    sid       = "SendFromOwnAddress"
    actions   = ["ses:SendEmail", "ses:SendRawEmail"]
    resources = [aws_ses_email_identity.sender.arn]

    condition {
      test     = "StringEquals"
      variable = "ses:FromAddress"
      values   = [var.sender]
    }
  }
}

resource "aws_iam_policy" "send" {
  name        = "${var.name_prefix}-email-send"
  description = "Send e-mail from the application's own address only."
  policy      = data.aws_iam_policy_document.send.json
}

resource "aws_iam_role_policy_attachment" "send" {
  for_each = toset(var.sender_role_names)

  role       = each.value
  policy_arn = aws_iam_policy.send.arn
}
