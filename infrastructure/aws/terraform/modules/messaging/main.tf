data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

data "aws_region" "current" {}

locals {
  account_root_arn = "arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:root"
  region           = data.aws_region.current.region
  queues = {
    for routing_key in var.routing_keys :
    routing_key => "${var.name_prefix}-${replace("${var.queue_prefix}.${routing_key}", ".", "-")}"
  }
}

resource "aws_kms_key" "messaging" {
  description             = "${var.name_prefix} event topic and queues"
  enable_key_rotation     = true
  deletion_window_in_days = var.key_deletion_window_days
  policy                  = data.aws_iam_policy_document.key.json
}

resource "aws_kms_alias" "messaging" {
  name          = "alias/${var.name_prefix}-messaging"
  target_key_id = aws_kms_key.messaging.key_id
}

resource "aws_sns_topic" "events" {
  name              = "${var.name_prefix}-${var.topic_name}"
  kms_master_key_id = aws_kms_key.messaging.arn
}
