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
    sid       = "DecryptThroughSecretsManager"
    actions   = ["kms:Decrypt", "kms:DescribeKey"]
    resources = ["*"]

    principals {
      type        = "AWS"
      identifiers = var.reader_role_arns
    }

    condition {
      test     = "StringEquals"
      variable = "kms:ViaService"
      values   = ["secretsmanager.${data.aws_region.current.region}.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "secret" {
  statement {
    sid       = "DenyReadToOtherPrincipals"
    effect    = "Deny"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = ["*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    condition {
      test     = "StringNotEquals"
      variable = "aws:PrincipalArn"
      values   = var.reader_role_arns
    }
  }
}

data "aws_iam_policy_document" "read" {
  statement {
    sid       = "ReadApplicationSecret"
    actions   = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
    resources = [aws_secretsmanager_secret.app.arn]
  }

  statement {
    sid       = "DecryptApplicationSecret"
    actions   = ["kms:Decrypt"]
    resources = [aws_kms_key.secrets.arn]

    condition {
      test     = "StringEquals"
      variable = "kms:ViaService"
      values   = ["secretsmanager.${data.aws_region.current.region}.amazonaws.com"]
    }
  }
}

resource "aws_iam_policy" "read" {
  name        = "${var.name_prefix}-secrets-read"
  description = "Read the application's own secret and nothing else."
  policy      = data.aws_iam_policy_document.read.json
}

resource "aws_iam_role_policy_attachment" "read" {
  for_each = toset(var.reader_role_names)

  role       = each.value
  policy_arn = aws_iam_policy.read.arn
}
