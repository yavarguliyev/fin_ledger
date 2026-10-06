import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import { BaseMailTransport } from './base/base-mail.transport';
import { MailMessageDto } from '../dtos/mail-message.dto';
import { SesOptionsDto } from '../dtos/ses-options.dto';

export class SesTransport extends BaseMailTransport {
  private readonly client: SESClient;

  constructor ({ region, endpoint, accessKeyId, secretAccessKey, from }: SesOptionsDto) {
    super({ from });
    this.client = new SESClient({
      region,
      ...(endpoint && { endpoint }),
      ...(accessKeyId && secretAccessKey && { credentials: { accessKeyId, secretAccessKey } })
    });
  }

  protected async deliver ({ from, to, subject, text, html }: MailMessageDto): Promise<void> {
    await this.client.send(
      new SendEmailCommand({
        Source: from,
        Destination: { ToAddresses: [to] },
        Message: { Subject: { Data: subject }, Body: { Text: { Data: text }, Html: { Data: html } } }
      })
    );
  }
}
