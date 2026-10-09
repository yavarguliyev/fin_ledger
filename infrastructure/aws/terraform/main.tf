module "identity" {
  source = "./modules/identity"

  name_prefix = local.name_prefix
}

module "storage" {
  source = "./modules/storage"

  name_prefix              = local.name_prefix
  bucket_name              = var.storage_bucket_name
  object_prefixes          = var.storage_object_prefixes
  enforce_tls              = var.enforce_tls
  key_deletion_window_days = var.key_deletion_window_days
  access_role_names        = [module.identity.api_role.name]
  access_principal_arns    = [module.identity.api_role.arn]
}

module "email" {
  source = "./modules/email"

  name_prefix       = local.name_prefix
  sender            = var.email_sender
  sender_role_names = [module.identity.worker_role.name]
}

module "secrets" {
  source = "./modules/secrets"

  name_prefix              = local.name_prefix
  application              = var.secrets_application
  key_deletion_window_days = var.key_deletion_window_days
  recovery_window_days     = var.secret_recovery_window_days
  reader_role_names        = [module.identity.api_role.name, module.identity.worker_role.name]
  reader_role_arns         = [module.identity.api_role.arn, module.identity.worker_role.arn]
}

module "messaging" {
  source = "./modules/messaging"

  name_prefix              = local.name_prefix
  topic_name               = var.messaging_topic_name
  queue_prefix             = var.messaging_queue_prefix
  routing_keys             = var.messaging_routing_keys
  enforce_tls              = var.enforce_tls
  key_deletion_window_days = var.key_deletion_window_days
  principal_arns           = [module.identity.api_role.arn, module.identity.worker_role.arn]
  publisher_role_names     = [module.identity.api_role.name, module.identity.worker_role.name]
  consumer_role_names      = [module.identity.worker_role.name]
  monitor_role_names       = [module.identity.api_role.name]
}

module "sms" {
  source = "./modules/sms"

  name_prefix         = local.name_prefix
  monthly_spend_limit = var.sms_monthly_spend_limit
  default_sender_id   = var.sms_sender_id
  sender_role_names   = [module.identity.worker_role.name]
}

moved {
  from = module.webhooks
  to   = module.edge
}

module "edge" {
  source = "./modules/edge"

  name_prefix              = local.name_prefix
  api_upstream_url         = var.api_upstream_url
  payment_providers        = var.webhook_providers
  signature_headers        = var.webhook_signature_headers
  key_deletion_window_days = var.key_deletion_window_days
  consumer_role_names      = [module.identity.worker_role.name]
  consumer_role_arns       = [module.identity.worker_role.arn]
}
