data "aws_iam_policy_document" "workload_trust" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = [var.workload_service]
    }
  }
}

resource "aws_iam_role" "api" {
  name                 = "${var.name_prefix}-api"
  description          = "Identity of the HTTP API process."
  assume_role_policy   = data.aws_iam_policy_document.workload_trust.json
  max_session_duration = var.max_session_seconds
}

resource "aws_iam_role" "worker" {
  name                 = "${var.name_prefix}-worker"
  description          = "Identity of the background worker process."
  assume_role_policy   = data.aws_iam_policy_document.workload_trust.json
  max_session_duration = var.max_session_seconds
}
