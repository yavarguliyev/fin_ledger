data "aws_iam_policy_document" "key" {
  statement {
    sid       = "AccountAdministration"
    actions   = ["kms:*"]
    resources = ["*"]

    principals {
      type        = "AWS"
      identifiers = [local.account_root_arn]
    }
  }

  statement {
    sid       = "UseThroughSqs"
    actions   = ["kms:GenerateDataKey*", "kms:Decrypt"]
    resources = ["*"]

    principals {
      type        = "AWS"
      identifiers = concat([aws_iam_role.gateway.arn], var.consumer_role_arns)
    }

    condition {
      test     = "StringEquals"
      variable = "kms:ViaService"
      values   = ["sqs.${local.region}.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "gateway_trust" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "gateway" {
  name               = "${var.name_prefix}-webhooks-gateway"
  description        = "Lets API Gateway put webhook requests on the webhooks queue."
  assume_role_policy = data.aws_iam_policy_document.gateway_trust.json
}

data "aws_iam_policy_document" "enqueue" {
  statement {
    sid       = "EnqueueWebhooks"
    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.webhooks.arn]
  }

  statement {
    sid       = "EncryptWebhooks"
    actions   = ["kms:GenerateDataKey*", "kms:Decrypt"]
    resources = [aws_kms_key.webhooks.arn]
  }
}

resource "aws_iam_role_policy" "enqueue" {
  name   = "${var.name_prefix}-webhooks-enqueue"
  role   = aws_iam_role.gateway.id
  policy = data.aws_iam_policy_document.enqueue.json
}

data "aws_iam_policy_document" "consume" {
  statement {
    sid       = "ConsumeWebhooks"
    actions   = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:ChangeMessageVisibility", "sqs:GetQueueUrl", "sqs:GetQueueAttributes", "sqs:SendMessage"]
    resources = [aws_sqs_queue.webhooks.arn, aws_sqs_queue.dead_letter.arn]
  }

  statement {
    sid       = "DecryptWebhooks"
    actions   = ["kms:GenerateDataKey*", "kms:Decrypt"]
    resources = [aws_kms_key.webhooks.arn]
  }
}

resource "aws_iam_policy" "consume" {
  name        = "${var.name_prefix}-webhooks-consume"
  description = "Consume, retry and replay the webhooks queue."
  policy      = data.aws_iam_policy_document.consume.json
}

resource "aws_iam_role_policy_attachment" "consume" {
  for_each = toset(var.consumer_role_names)

  role       = each.value
  policy_arn = aws_iam_policy.consume.arn
}
