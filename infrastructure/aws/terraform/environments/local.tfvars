project                     = "ddd"
environment                 = "local"
region                      = "us-east-1"
storage_bucket_name         = "realtime-wallet-payments"
storage_object_prefixes     = ["user-", "support/"]
email_sender                = "noreply@realtime-wallet-payments.com"
enforce_tls                 = false
key_deletion_window_days    = 7
secret_recovery_window_days = 7
messaging_routing_keys      = ["bet.settled", "payment.completed", "payment.failed", "user.registered", "wallet.credited", "wallet.debited"]
api_upstream_url            = "http://host.docker.internal:3000"
app_parameters = {
  ALLOWED_ORIGINS = "http://localhost:4200,http://ddd-local-web.s3-website.localhost.localstack.cloud:4566"
  FRONTEND_URL    = "http://localhost:4200"
  EMAIL_FROM      = "noreply@realtime-wallet-payments.com"
  MFA_ISSUER      = "Realtime Wallet"
}
