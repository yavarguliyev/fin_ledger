import { AuditActorDto } from '../dtos/audit/audit-actor.dto';
import { AuditEventDto } from '../dtos/audit/audit-event.dto';
import { AuditHeaderDto } from '../dtos/audit/audit-header.dto';
import { BuildAuditEventDto } from '../dtos/audit/build-audit-event.dto';
import { ResolveEntityIdDto } from '../dtos/audit/resolve-entity-id.dto';
import { AuditRequestRefDto } from '../dtos/audit/audit-request-ref.dto';
import { RedactDto } from '../dtos/audit/redact.dto';
import { AUDIT_REDACTED_KEYS } from '../constants/audit-redacted-keys.constant';
import { UnknownRecord } from '../types/base.type';

export class AuditHelper {
  static buildEvent (params: BuildAuditEventDto): AuditEventDto {
    const { metadata, request, result } = params;
    const { action, entityType, entityIdParam } = metadata;
    const entityId = AuditHelper.resolveEntityId({ request, result, entityIdParam });

    return {
      ...AuditHelper.actorFrom({ request }),
      action,
      entityType,
      ...(entityId && { entityId }),
      ...(AuditHelper.redact({ state: result }) && { afterState: AuditHelper.redact({ state: result }) }),
      occurredAt: new Date().toISOString()
    };
  }

  static actorFrom ({ request }: AuditRequestRefDto): AuditActorDto {
    const ipAddress = AuditHelper.firstIp({ request });
    const userAgent = request.headers['user-agent'];
    const requestId = AuditHelper.header({ request, name: 'x-request-id' });

    return {
      ...(request.user?.userId && { actorUserId: request.user.userId }),
      ...(request.user?.role && { actorRole: request.user.role }),
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
      ...(requestId && { requestId: requestId.slice(0, 64) })
    };
  }

  static redact ({ state }: RedactDto): UnknownRecord | undefined {
    if (!state || typeof state !== 'object' || Array.isArray(state)) return undefined;

    const entries = Object.entries(state as UnknownRecord);
    if (entries.length === 0) return undefined;

    return entries.reduce<UnknownRecord>((accumulator, [key, value]) => {
      accumulator[key] = AUDIT_REDACTED_KEYS.includes(key) ? '[redacted]' : value;

      return accumulator;
    }, {});
  }

  private static resolveEntityId (params: ResolveEntityIdDto): string | undefined {
    const { request, result, entityIdParam } = params;
    const fromParam = entityIdParam ? (request.params as UnknownRecord)[entityIdParam] : undefined;
    if (typeof fromParam === 'string') return fromParam;

    const id = (result as UnknownRecord | null)?.['id'];

    return typeof id === 'string' ? id : undefined;
  }

  private static firstIp ({ request }: AuditRequestRefDto): string | undefined {
    const candidate = (AuditHelper.header({ request, name: 'x-forwarded-for' }) ?? request.ip)?.split(',')[0]?.trim();

    return candidate && candidate.length > 0 ? candidate : undefined;
  }

  private static header ({ request, name }: AuditHeaderDto): string | undefined {
    const value = request.headers[name];

    return Array.isArray(value) ? value[0] : value;
  }
}
