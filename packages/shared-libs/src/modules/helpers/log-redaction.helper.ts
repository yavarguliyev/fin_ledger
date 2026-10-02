import { LOG_REDACTION } from '../constants/logging/log-redaction.constant';
import { RedactLogDto } from '../dtos/logging/redact-log.dto';

export class LogRedactionHelper {
  static redact ({ message, revealLinks }: RedactLogDto): string {
    let text = message;
    for (const rule of LOG_REDACTION.ALWAYS) text = text.replace(rule.pattern, rule.replacement);
    if (!revealLinks) for (const rule of LOG_REDACTION.LINKS) text = text.replace(rule.pattern, rule.replacement);
    return text;
  }
}
