import { createHash, timingSafeEqual } from 'node:crypto';

import { MONITORING as M } from '../constants/monitoring.constant';
import { AlertMessageDto } from '../dtos/alert/alert-message.dto';
import { AlertRefDto } from '../dtos/alert/alert-ref.dto';
import { AlertDurationDto } from '../dtos/alert/alert-duration.dto';
import { WebhookTokenDto } from '../dtos/alert/webhook-token.dto';

export class AlertMessageHelper {
  static describe ({ alert }: AlertRefDto): AlertMessageDto {
    const annotations = alert.annotations ?? {};
    const summary = annotations[M.SUMMARY_ANNOTATION] ?? alert.labels[M.ALERTNAME_LABEL] ?? M.UNKNOWN;

    if (alert.status !== M.FIRING) {
      return {
        title: annotations[M.RECOVERY_ANNOTATION] ?? `${M.RESOLVED_PREFIX}${summary}`,
        content: AlertMessageHelper.lasted({ startsAt: alert.startsAt, endsAt: alert.endsAt })
      };
    }

    const severity = alert.labels[M.SEVERITY_LABEL];
    return {
      title: severity ? `${summary}${M.TITLE_SEPARATOR}${severity.charAt(0).toUpperCase()}${severity.slice(1)}` : summary,
      content: annotations[M.DESCRIPTION_ANNOTATION] ?? ''
    };
  }

  static isAuthorized ({ authorization, expected }: WebhookTokenDto): boolean {
    if (!expected || !authorization?.startsWith(M.BEARER_PREFIX)) return false;
    const digest = (value: string): Buffer => createHash(M.DIGEST).update(value).digest();
    return timingSafeEqual(digest(authorization.slice(M.BEARER_PREFIX.length)), digest(expected));
  }

  private static lasted ({ startsAt, endsAt }: AlertDurationDto): string {
    const elapsed = Date.parse(endsAt ?? '') - Date.parse(startsAt ?? '');
    if (!Number.isFinite(elapsed) || elapsed <= 0) return M.BACK_TO_NORMAL;

    const minutes = Math.max(1, Math.round(elapsed / M.MINUTE_MS));
    const hours = Math.floor(minutes / M.MINUTES_PER_HOUR);
    const rest = minutes % M.MINUTES_PER_HOUR;
    const text = hours > 0 ? `${hours}${M.HOURS_UNIT}${rest > 0 ? `${M.UNIT_GAP}${rest}${M.MINUTES_UNIT}` : ''}` : `${minutes}${M.MINUTES_UNIT}`;

    return `${M.LASTED_PREFIX}${text}${M.SENTENCE_END}`;
  }
}
