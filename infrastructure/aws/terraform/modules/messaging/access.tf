locals {
  queue_arns = concat([for queue in aws_sqs_queue.main : queue.arn], [for queue in aws_sqs_queue.dead_letter : queue.arn])
}

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
    sid       = "TopicDeliversToEncryptedQueues"
    actions   = ["kms:GenerateDataKey*", "kms:Decrypt"]
    resources = ["*"]

    principals {
      type        = "Service"
      identifiers = ["sns.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [data.aws_caller_identity.current.account_id]
    }
  }

  statement {
    sid       = "ApplicationUseThroughMessaging"
    actions   = ["kms:GenerateDataKey*", "kms:Decrypt"]
    resources = ["*"]

    principals {
      type        = "AWS"
      identifiers = var.principal_arns
    }

    condition {
      test     = "StringEquals"
      variable = "kms:ViaService"
      values   = ["sns.${local.region}.amazonaws.com", "sqs.${local.region}.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "publish" {
  statement {
    sid       = "PublishEvents"
    actions   = ["sns:Publish"]
    resources = [aws_sns_topic.events.arn]
  }

  statement {
    sid       = "EncryptEvents"
    actions   = ["kms:GenerateDataKey*", "kms:Decrypt"]
    resources = [aws_kms_key.messaging.arn]
  }
}

data "aws_iam_policy_document" "consume" {
  statement {
    sid       = "ConsumeAndReplay"
    actions   = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:ChangeMessageVisibility", "sqs:SendMessage", "sqs:GetQueueUrl", "sqs:GetQueueAttributes"]
    resources = local.queue_arns
  }

  statement {
    sid       = "DecryptEvents"
    actions   = ["kms:GenerateDataKey*", "kms:Decrypt"]
    resources = [aws_kms_key.messaging.arn]
  }
}

data "aws_iam_policy_document" "monitor" {
  statement {
    sid       = "ReadQueueDepth"
    actions   = ["sqs:GetQueueUrl", "sqs:GetQueueAttributes"]
    resources = local.queue_arns
  }
}

resource "aws_iam_policy" "publish" {
  name        = "${var.name_prefix}-messaging-publish"
  description = "Publish to the event topic only."
  policy      = data.aws_iam_policy_document.publish.json
}

resource "aws_iam_policy" "consume" {
  name        = "${var.name_prefix}-messaging-consume"
  description = "Consume, retry and replay the application's own queues."
  policy      = data.aws_iam_policy_document.consume.json
}

resource "aws_iam_policy" "monitor" {
  name        = "${var.name_prefix}-messaging-monitor"
  description = "Read queue depth for health checks and metrics."
  policy      = data.aws_iam_policy_document.monitor.json
}

resource "aws_iam_role_policy_attachment" "publish" {
  for_each = toset(var.publisher_role_names)

  role       = each.value
  policy_arn = aws_iam_policy.publish.arn
}

resource "aws_iam_role_policy_attachment" "consume" {
  for_each = toset(var.consumer_role_names)

  role       = each.value
  policy_arn = aws_iam_policy.consume.arn
}

resource "aws_iam_role_policy_attachment" "monitor" {
  for_each = toset(var.monitor_role_names)

  role       = each.value
  policy_arn = aws_iam_policy.monitor.arn
}
