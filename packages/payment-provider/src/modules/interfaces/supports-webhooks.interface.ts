import { WebhookEventDto } from '../dtos/operation/webhook-event.dto';
import { ExtractSignatureDto } from '../dtos/contract/extract-signature.dto';
import { ConstructWebhookEventDto } from '../dtos/contract/construct-webhook-event.dto';

export interface SupportsWebhooks {
  extractSignature(dto: ExtractSignatureDto): string;
  constructWebhookEvent(dto: ConstructWebhookEventDto): Promise<WebhookEventDto>;
}
