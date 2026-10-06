import { Environment, MailTransportKind } from '@common/shared-libs';

import { MAIL_CONSTANTS } from '../constants/mail/mail.constant';
import { ResolveTransportDto } from '../dtos/resolve-transport.dto';
import { MailTransport } from '../interfaces/mail-transport.interface';
import { ConsoleMailTransport } from '../transports/console-mail.transport';
import { SesTransport } from '../transports/ses.transport';
import { SmtpTransport } from '../transports/smtp.transport';

export class MailTransportHelper {
  static resolve (options: ResolveTransportDto): MailTransport {
    const { configService, logger } = options;
    const kind = configService.get<MailTransportKind>('MAIL_TRANSPORT') ?? MailTransportKind.CONSOLE;

    if (kind === MailTransportKind.SES) return MailTransportHelper.ses(options);
    if (kind === MailTransportKind.SMTP) return MailTransportHelper.smtp(options);

    const revealLink = configService.get<Environment>('NODE_ENV') !== Environment.Production;

    return new ConsoleMailTransport({ logger, revealLink });
  }

  private static smtp ({ configService, from }: ResolveTransportDto): MailTransport {
    const user = configService.get<string>('SMTP_USER');
    const pass = configService.get<string>('SMTP_PASSWORD');

    return new SmtpTransport({
      host: configService.get<string>('SMTP_HOST')!,
      port: configService.get<number>('SMTP_PORT') ?? MAIL_CONSTANTS.SMTP_DEFAULT_PORT,
      from,
      ...(user && { user }),
      ...(pass && { pass })
    });
  }

  private static ses ({ configService, from }: ResolveTransportDto): MailTransport {
    const endpoint = configService.get<string>('SES_ENDPOINT');
    const accessKeyId = configService.get<string>('SES_ACCESS_KEY_ID');
    const secretAccessKey = configService.get<string>('SES_SECRET_ACCESS_KEY');

    return new SesTransport({
      region: configService.get<string>('SES_REGION') ?? MAIL_CONSTANTS.SES_DEFAULT_REGION,
      from,
      ...(endpoint && { endpoint }),
      ...(accessKeyId && { accessKeyId }),
      ...(secretAccessKey && { secretAccessKey })
    });
  }
}
