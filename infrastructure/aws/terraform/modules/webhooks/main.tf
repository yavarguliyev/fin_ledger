data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

data "aws_region" "current" {}

locals {
  account_id       = data.aws_caller_identity.current.account_id
  account_root_arn = "arn:${data.aws_partition.current.partition}:iam::${local.account_id}:root"
  region           = data.aws_region.current.region
  queue_name       = "${var.name_prefix}-${var.queue_name}"
}

resource "aws_kms_key" "webhooks" {
  description             = "${var.name_prefix} webhooks queue"
  enable_key_rotation     = true
  deletion_window_in_days = var.key_deletion_window_days
  policy                  = data.aws_iam_policy_document.key.json
}

resource "aws_kms_alias" "webhooks" {
  name          = "alias/${var.name_prefix}-webhooks"
  target_key_id = aws_kms_key.webhooks.key_id
}

resource "aws_sqs_queue" "dead_letter" {
  name                              = "${local.queue_name}-${var.dead_letter_suffix}"
  message_retention_seconds         = var.dead_letter_retention_seconds
  kms_master_key_id                 = aws_kms_key.webhooks.arn
  kms_data_key_reuse_period_seconds = var.kms_data_key_reuse_seconds
}

resource "aws_sqs_queue" "webhooks" {
  name                              = local.queue_name
  visibility_timeout_seconds        = var.visibility_timeout_seconds
  message_retention_seconds         = var.message_retention_seconds
  receive_wait_time_seconds         = var.receive_wait_seconds
  kms_master_key_id                 = aws_kms_key.webhooks.arn
  kms_data_key_reuse_period_seconds = var.kms_data_key_reuse_seconds

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dead_letter.arn
    maxReceiveCount     = var.max_receive_count
  })
}

resource "aws_sqs_queue_redrive_allow_policy" "dead_letter" {
  queue_url = aws_sqs_queue.dead_letter.id

  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue"
    sourceQueueArns   = [aws_sqs_queue.webhooks.arn]
  })
}
