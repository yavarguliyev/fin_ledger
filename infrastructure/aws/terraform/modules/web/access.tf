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

  dynamic "statement" {
    for_each = local.cdn_enabled ? [1] : []

    content {
      sid       = "CloudFrontReadsTheClient"
      actions   = ["kms:Decrypt"]
      resources = ["*"]

      principals {
        type        = "Service"
        identifiers = ["cloudfront.amazonaws.com"]
      }

      condition {
        test     = "StringEquals"
        variable = "aws:SourceArn"
        values   = [var.cloudfront_distribution_arn]
      }
    }
  }
}

data "aws_iam_policy_document" "bucket" {
  dynamic "statement" {
    for_each = local.cdn_enabled ? [1] : []

    content {
      sid       = "CloudFrontOriginAccessOnly"
      actions   = ["s3:GetObject"]
      resources = ["${aws_s3_bucket.web.arn}/*"]

      principals {
        type        = "Service"
        identifiers = ["cloudfront.amazonaws.com"]
      }

      condition {
        test     = "StringEquals"
        variable = "aws:SourceArn"
        values   = [var.cloudfront_distribution_arn]
      }
    }
  }

  dynamic "statement" {
    for_each = var.enforce_tls ? [1] : []

    content {
      sid       = "DenyInsecureTransport"
      effect    = "Deny"
      actions   = ["s3:*"]
      resources = [aws_s3_bucket.web.arn, "${aws_s3_bucket.web.arn}/*"]

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

resource "aws_s3_bucket_policy" "web" {
  count = local.cdn_enabled || var.enforce_tls ? 1 : 0

  bucket = aws_s3_bucket.web.id
  policy = data.aws_iam_policy_document.bucket.json

  depends_on = [aws_s3_bucket_public_access_block.web]
}
