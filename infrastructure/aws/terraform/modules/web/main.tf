data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

locals {
  account_root_arn = "arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:root"
  cdn_enabled      = var.cloudfront_distribution_arn != null
}

resource "aws_kms_key" "web" {
  description             = "${var.name_prefix} web client bucket"
  enable_key_rotation     = true
  deletion_window_in_days = var.key_deletion_window_days
  policy                  = data.aws_iam_policy_document.key.json
}

resource "aws_kms_alias" "web" {
  name          = "alias/${var.name_prefix}-web"
  target_key_id = aws_kms_key.web.key_id
}

resource "aws_s3_bucket" "web" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_ownership_controls" "web" {
  bucket = aws_s3_bucket.web.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "web" {
  bucket                  = aws_s3_bucket.web.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "web" {
  bucket = aws_s3_bucket.web.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "web" {
  bucket = aws_s3_bucket.web.id

  rule {
    bucket_key_enabled = true

    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.web.arn
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "web" {
  bucket = aws_s3_bucket.web.id

  rule {
    id     = "expire-old-builds"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = var.old_build_retention_days
    }
  }
}

resource "aws_s3_bucket_website_configuration" "web" {
  bucket = aws_s3_bucket.web.id

  index_document {
    suffix = var.index_document
  }

  error_document {
    key = var.index_document
  }
}
