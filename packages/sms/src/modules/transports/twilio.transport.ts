import { InternalServerErrorException } from '@nestjs/common';

import { BaseSmsTransport } from './base/base-sms.transport';
import { SMS_CONSTANTS } from '../constants/sms/sms.constant';
import { SmsMessageDto } from '../dtos/sms-message.dto';
import { TwilioOptionsDto } from '../dtos/twilio-options.dto';

export class TwilioTransport extends BaseSmsTransport {
  private readonly endpoint: string;
  private readonly authorization: string;

  constructor ({ accountSid, authToken, from, baseUrl }: TwilioOptionsDto) {
    super({ from });
    this.endpoint = `${baseUrl ?? SMS_CONSTANTS.TWILIO_API_BASE}/${accountSid}/Messages.json`;
    this.authorization = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;
  }

  protected async deliver ({ from, to, body }: SmsMessageDto): Promise<void> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { authorization: this.authorization, 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ From: from, To: to, Body: body }).toString()
    });

    if (!response.ok) throw new InternalServerErrorException(`Twilio rejected the message for ${to} with ${response.status}`);
  }
}
