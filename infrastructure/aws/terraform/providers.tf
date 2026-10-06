locals {
  use_localstack = var.localstack_endpoint != null
  name_prefix    = "${var.project}-${var.environment}"
}

provider "aws" {
  region = var.region

  access_key                  = local.use_localstack ? var.localstack_credentials.access_key : null
  secret_key                  = local.use_localstack ? var.localstack_credentials.secret_key : null
  skip_credentials_validation = local.use_localstack
  skip_metadata_api_check     = local.use_localstack
  skip_requesting_account_id  = local.use_localstack
  s3_use_path_style           = local.use_localstack

  dynamic "endpoints" {
    for_each = local.use_localstack ? [var.localstack_endpoint] : []

    content {
      apigateway     = endpoints.value
      iam            = endpoints.value
      kms            = endpoints.value
      s3             = endpoints.value
      secretsmanager = endpoints.value
      ses            = endpoints.value
      sns            = endpoints.value
      sqs            = endpoints.value
      ssm            = endpoints.value
      sts            = endpoints.value
    }
  }

  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
