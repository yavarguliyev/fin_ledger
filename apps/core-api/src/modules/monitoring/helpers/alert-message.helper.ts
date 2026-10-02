import { createHash, timingSafeEqual } from 'node:crypto';

import { MONITORING } from '../constants/monitoring.constant';
import { AlertMessageDto } from '../dtos/alert/alert-message.dto';
import { AlertRefDto } from '../dtos/alert/alert-ref.dto';
import { WebhookTokenDto } from '../dtos/alert/webhook-token.dto';

export class AlertMessageHelper {
  static describe ({ alert }: AlertRefDto): AlertMessageDto {
    const name = alert.labels[MONITORING.ALERTNAME_LABEL] ?? MONITORING.UNKNOWN;
    const severity = alert.labels[MONITORING.SEVERITY_LABEL];
    const prefix = alert.status === MONITORING.FIRING ? MONITORING.FIRING_PREFIX : MONITORING.RESOLVED_PREFIX;
    const summary = alert.annotations?.[MONITORING.SUMMARY_ANNOTATION] ?? name;
    const description = alert.annotations?.[MONITORING.DESCRIPTION_ANNOTATION];

    return {
      title: `${prefix}${MONITORING.SEPARATOR}${name}${severity ? `${MONITORING.SEVERITY_OPEN}${severity}${MONITORING.SEVERITY_CLOSE}` : ''}`,
      content: description ? `${summary}.${MONITORING.SENTENCE_GAP}${description}` : summary
    };
  }

  static isAuthorized ({ authorization, expected }: WebhookTokenDto): boolean {
    if (!expected || !authorization?.startsWith(MONITORING.BEARER_PREFIX)) return false;
    const digest = (value: string): Buffer => createHash(MONITORING.DIGEST).update(value).digest();
    return timingSafeEqual(digest(authorization.slice(MONITORING.BEARER_PREFIX.length)), digest(expected));
  }
}
