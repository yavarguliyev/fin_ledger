import { ConsoleLogger, LogLevel } from '@nestjs/common';

import { LogRedactionHelper } from '../helpers/log-redaction.helper';
import { RedactingLoggerOptionsDto } from '../dtos/logging/redacting-logger-options.dto';

export class RedactingLogger extends ConsoleLogger {
  private readonly revealLinks: boolean;

  constructor ({ revealLinks }: RedactingLoggerOptionsDto) {
    super();
    this.revealLinks = revealLinks;
  }

  protected override stringifyMessage (message: unknown, logLevel: LogLevel): unknown {
    const text: unknown = super.stringifyMessage(message, logLevel);
    return typeof text === 'string' ? LogRedactionHelper.redact({ message: text, revealLinks: this.revealLinks }) : text;
  }
}
