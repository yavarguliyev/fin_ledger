import { Environment, SmsTransportKind } from '@common/shared-libs';

import { SMS_CONSTANTS } from '../constants/sms/sms.constant';
import { ResolveSmsTransportDto } from '../dtos/resolve-sms-transport.dto';
import { SmsTransport } from '../interfaces/sms-transport.interface';
import { ConsoleSmsTransport } from '../transports/console-sms.transport';
import { SnsSmsTransport } from '../transports/sns-sms.transport';
import { TwilioTransport } from '../transports/twilio.transport';

export class SmsTransportHelper {
  static resolve (options: ResolveSmsTransportDto): SmsTransport {
    const { configService, logger } = options;
    const kind = configService.get<SmsTransportKind>('SMS_TRANSPORT') ?? SmsTransportKind.CONSOLE;

    if (kind === SmsTransportKind.SNS) return SmsTransportHelper.sns(options);
    if (kind === SmsTransportKind.TWILIO) return SmsTransportHelper.twilio(options);

    const revealBody = configService.get<Environment>('NODE_ENV') !== Environment.Production;

    return new ConsoleSmsTransport({ logger, revealBody });
  }

  private static twilio ({ configService, from }: ResolveSmsTransportDto): SmsTransport {
    const baseUrl = configService.get<string>('TWILIO_API_BASE');

    return new TwilioTransport({
      accountSid: configService.get<string>('TWILIO_ACCOUNT_SID')!,
      authToken: configService.get<string>('TWILIO_AUTH_TOKEN')!,
      from,
      ...(baseUrl && { baseUrl })
    });
  }

  private static sns ({ configService, from }: ResolveSmsTransportDto): SmsTransport {
    const endpoint = configService.get<string>('SNS_SMS_ENDPOINT');
    const accessKeyId = configService.get<string>('SNS_SMS_ACCESS_KEY_ID');
    const secretAccessKey = configService.get<string>('SNS_SMS_SECRET_ACCESS_KEY');

    return new SnsSmsTransport({
      region: configService.get<string>('SNS_SMS_REGION') ?? SMS_CONSTANTS.SNS_DEFAULT_REGION,
      from,
      ...(endpoint && { endpoint }),
      ...(accessKeyId && { accessKeyId }),
      ...(secretAccessKey && { secretAccessKey })
    });
  }
}
