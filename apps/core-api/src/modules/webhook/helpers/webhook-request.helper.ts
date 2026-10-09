import { HandleWebhookDto } from '../dtos/input/handle-webhook.dto';
import { WebhookHttpRequestDto } from '../dtos/request/webhook-http-request.dto';

export class WebhookRequestHelper {
  static fromHttp ({ provider, req }: WebhookHttpRequestDto): HandleWebhookDto {
    return { provider, rawPayload: req.rawBody ?? JSON.stringify(req.body), headers: req.headers };
  }
}
