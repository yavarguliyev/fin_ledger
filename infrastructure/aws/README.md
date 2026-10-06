# Local AWS with LocalStack and Terraform

This folder runs a local copy of the AWS services the app uses, so you can see how it behaves on AWS without an AWS
account or a bill. LocalStack emulates AWS on `http://localhost:4566`; Terraform creates the resources in it.

Nothing needs to be installed except Docker. LocalStack and Terraform both run as containers with pinned versions.

## First run

1. Create a free account at <https://app.localstack.cloud> and copy your **personal auth token**.
2. Put it in the repository root `.env` (git-ignored):

   ```
   LOCALSTACK_AUTH_TOKEN=ls-...
   ```

3. Start everything:

   ```bash
   npm run aws:up
   ```

   This starts LocalStack, creates the resources with Terraform and prints what it created. Open
   <https://app.localstack.cloud> → **Resource Browser** to see them.

| Command | What it does |
| --- | --- |
| `npm run aws:up` | Start LocalStack and create or update every resource. Safe to run again. |
| `npm run aws:plan` | Show what Terraform would change, without changing anything. |
| `npm run aws:down` | Stop LocalStack. The free plan keeps nothing, so the next `aws:up` recreates everything. |
| `npm run aws:secrets` | Copy the app's secrets from `apps/core-api/.env.local` (and `.env.aws`) into Secrets Manager. `aws:up` runs it too. |
| `npm run aws:scan` | Scan the Terraform for security misconfigurations (Trivy). `aws:up` runs it first and stops on findings. |

## What is created

| Module | Resources | Used for |
| --- | --- | --- |
| `identity` | IAM roles for the API and the worker | What each process may do on AWS |
| `storage` | S3 bucket, KMS key, bucket policy, lifecycle, access-log bucket, least-privilege access policy for the API role | Profile images and chat files |
| `email` | SES sender identity and a send-only policy for the worker role | Outgoing e-mail |
| `messaging` | SNS topic `ddd-local-wallet-events`, one SQS queue and dead-letter queue per event type, filtered subscriptions, its own KMS key; publish, consume and monitor policies | Alternative to RabbitMQ for notifications (`QUEUE_TRANSPORT=sqs`) |
| `secrets` | Secrets Manager secret `ddd-local/core-api`, its own KMS key, a read-only policy for the API and worker roles | Passwords, signing and encryption keys, Stripe and Telegram tokens |

## Security model

- **Least privilege.** The API role may read, write and delete only under the prefixes the app uses (`user-`,
  `support/`) and use only the storage key. The worker role may only send e-mail from the app's own address. No
  wildcard actions.
- **Encryption.** Files are encrypted with a customer-managed KMS key with automatic rotation; its key policy names the
  API role. A bucket policy refuses uploads encrypted with any other key, and (on real AWS) any request not made over
  HTTPS.
- **No public access**, bucket-owner-enforced object ownership, versioning, expiry of old versions after 30 days and of
  unfinished uploads after 7.
- **Access logs** go to a separate locked-down bucket, kept 90 days. It uses SSE-S3 because S3 cannot deliver logs to a
  KMS-encrypted bucket; this is the one accepted scanner finding, recorded with its reason in `trivyignore.yaml`.
- **Secrets.** Terraform creates the secret, its key and its policies but never its values, so no secret reaches the
  Terraform state. `aws:secrets` loads the keys listed in `secrets/core-api.keys` from the app's `.env` and never
  prints them. Only the API and worker roles may read the secret, and the key decrypts only through Secrets Manager.
- **Messaging.** The topic and every queue are encrypted with their own KMS key. A queue accepts messages only from
  the topic, and each subscription delivers only its own event type. After 4 deliveries a message moves to its
  dead-letter queue, kept 14 days for replay. Both roles may publish; only the worker consumes; the API may only read
  queue depth. SQS names cannot contain dots, so `notifications.wallet.credited` becomes
  `ddd-local-notifications-wallet-credited`. When a notification consumer is added, add its event type to
  `messaging_routing_keys`.
- **Scanning.** `aws:scan` fails on any medium, high or critical misconfiguration, and `aws:up` will not apply without it.

**What LocalStack's free plan does not do:** it does not enforce IAM or bucket policies (even with `ENFORCE_IAM=1`),
and its policy simulator is unreliable. Locally the app therefore uses LocalStack's default `test` credentials; the
roles and policies above are created and reviewed here and take effect on real AWS.

## Using it from the app

The app reads `apps/core-api/.env.local` (the local stack: MinIO, RabbitMQ, console e-mail) and, when it exists,
`apps/core-api/.env.aws` on top of it. The second file switches everything AWS-backed at once:

```bash
npm run aws:up
cp apps/core-api/.env.aws.example apps/core-api/.env.aws
```

| Concern | Without `.env.aws` | With `.env.aws` |
| --- | --- | --- |
| File storage | MinIO | S3 (`STORAGE_ENSURE_BUCKET=false`: Terraform owns the bucket and its encryption) |
| E-mail | console or SMTP | SES |
| Notifications | RabbitMQ | SNS topic and SQS queues |
| Secrets | `.env.local` | Secrets Manager, read at startup |

Delete `apps/core-api/.env.aws` to switch back. Locally `.env.local` stays the source of the secret values: `aws:up`
copies them into LocalStack, which forgets them on restart. On real AWS, drop the endpoint and access key lines from
`.env.aws` and run with the IAM roles.

## Layout

```
docker-compose.yml        LocalStack and the Terraform runner
scripts/                  up, plan and down; they check Docker and the token first
terraform/
  versions.tf             pinned Terraform and AWS provider versions
  backend.tf              local state in terraform/.state (git-ignored)
  providers.tf            points the AWS provider at LocalStack when localstack_endpoint is set
  variables.tf            inputs; environments/local.tfvars holds the local values
  main.tf, outputs.tf     wires the modules together
  modules/                one folder per concern
```

## Moving to real AWS later

The same modules work against a real account. Create an `environments/<name>.tfvars` without
`localstack_endpoint` and with `enforce_tls = true`, replace `backend.tf` with an S3 backend, and run Terraform with
your AWS credentials.

Production checklist (not emulated locally):

- [ ] Run the API and worker with their IAM roles (ECS task roles or instance profiles); no access keys.
- [ ] Terraform state in an encrypted, versioned S3 bucket with locking, one state per environment, admins only.
- [ ] Account-level S3 Block Public Access, CloudTrail, GuardDuty and Security Hub enabled.
- [ ] Private subnets and VPC endpoints for S3, KMS and Secrets Manager; a WAF in front of the public entry point.
- [ ] SES on the real domain with DKIM, SPF and DMARC, and bounce and complaint handling.
- [ ] Log retention set on every log group.
- [ ] Secret values set by an administrator or CI, not from a developer's `.env`; rotation enabled for the database
      passwords.

## Troubleshooting

- **`LOCALSTACK_AUTH_TOKEN is missing`** — add the token to the root `.env` (step 2).
- **Port 4566 already in use** — another LocalStack is running; stop it or run `npm run aws:down`.
- **The dashboard says it cannot connect** — LocalStack is not running; run `npm run aws:up`.
