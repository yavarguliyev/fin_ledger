resource "aws_sqs_queue" "dead_letter" {
  for_each = local.queues

  name                              = "${each.value}-${var.dead_letter_suffix}"
  message_retention_seconds         = var.dead_letter_retention_seconds
  kms_master_key_id                 = aws_kms_key.messaging.arn
  kms_data_key_reuse_period_seconds = var.kms_data_key_reuse_seconds
}

resource "aws_sqs_queue" "main" {
  for_each = local.queues

  name                              = each.value
  visibility_timeout_seconds        = var.visibility_timeout_seconds
  message_retention_seconds         = var.message_retention_seconds
  receive_wait_time_seconds         = var.receive_wait_seconds
  kms_master_key_id                 = aws_kms_key.messaging.arn
  kms_data_key_reuse_period_seconds = var.kms_data_key_reuse_seconds

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dead_letter[each.key].arn
    maxReceiveCount     = var.max_receive_count
  })
}

resource "aws_sqs_queue_redrive_allow_policy" "dead_letter" {
  for_each = local.queues

  queue_url = aws_sqs_queue.dead_letter[each.key].id

  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue"
    sourceQueueArns   = [aws_sqs_queue.main[each.key].arn]
  })
}

data "aws_iam_policy_document" "queue" {
  for_each = local.queues

  statement {
    sid       = "AcceptFromEventTopicOnly"
    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.main[each.key].arn]

    principals {
      type        = "Service"
      identifiers = ["sns.amazonaws.com"]
    }

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_sns_topic.events.arn]
    }
  }

  dynamic "statement" {
    for_each = var.enforce_tls ? [1] : []

    content {
      sid       = "DenyInsecureTransport"
      effect    = "Deny"
      actions   = ["sqs:*"]
      resources = [aws_sqs_queue.main[each.key].arn]

      principals {
        type        = "*"
        identifiers = ["*"]
      }

      condition {
        test     = "Bool"
        variable = "aws:SecureTransport"
        values   = ["false"]
      }
    }
  }
}

resource "aws_sqs_queue_policy" "main" {
  for_each = local.queues

  queue_url = aws_sqs_queue.main[each.key].id
  policy    = data.aws_iam_policy_document.queue[each.key].json
}

resource "aws_sns_topic_subscription" "queue" {
  for_each = local.queues

  topic_arn            = aws_sns_topic.events.arn
  protocol             = "sqs"
  endpoint             = aws_sqs_queue.main[each.key].arn
  raw_message_delivery = true
  filter_policy        = jsonencode({ (var.routing_key_attribute) = [each.key] })

  depends_on = [aws_sqs_queue_policy.main]
}
