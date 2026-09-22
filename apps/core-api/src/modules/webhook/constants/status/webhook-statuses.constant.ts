import { WebhookStatus } from '@common/libs';

export const WEBHOOK_HANDLED_STATUSES: readonly WebhookStatus[] = [WebhookStatus.IGNORED, WebhookStatus.PROCESSED];
