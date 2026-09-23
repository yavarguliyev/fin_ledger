import { InternalServerErrorException } from '@nestjs/common';

import { SMS_CONSTANTS } from '../constants/sms/sms.constant';
import { SendSmsDto } from '../dtos/send-sms.dto';
import { TwilioOptionsDto } from '../dtos/twilio-options.dto';
import { SmsTransport } from '../interfaces/sms-transport.interface';

export class TwilioTransport implements SmsTransport {
  private readonly endpoint: string;
  private readonly authorization: string;
  private readonly from: string;

  constructor ({ accountSid, authToken, from, baseUrl }: TwilioOptionsDto) {
    this.from = from;
    this.endpoint = `${baseUrl ?? SMS_CONSTANTS.TWILIO_API_BASE}/${accountSid}/Messages.json`;
    this.authorization = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;
  }

  async send ({ phoneNumber, message }: SendSmsDto): Promise<void> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { authorization: this.authorization, 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ From: this.from, To: phoneNumber, Body: message }).toString()
    });

    if (!response.ok) throw new InternalServerErrorException(`Twilio rejected the message for ${phoneNumber} with ${response.status}`);
  }
}
