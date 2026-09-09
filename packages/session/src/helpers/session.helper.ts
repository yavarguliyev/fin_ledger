import { UnauthorizedException } from '@nestjs/common';

import { RequestContext, SessionData } from '../interfaces/session.interface';

export const getSessionUser = (request: RequestContext): SessionData => {
  if (!request.user) throw new UnauthorizedException('User not authenticated');
  return request.user;
};

export const parseExpiryToSeconds = (expiry: string): number => {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (match && match[1] && match[2]) {
    const value = match[1];
    const unit = match[2];
    const num = parseInt(value, 10);

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400
    };

    const multiplier = multipliers[unit];
    return multiplier ? num * multiplier : 604800;
  }

  const parsed = parseInt(expiry, 10);
  if (!isNaN(parsed) && expiry === parsed.toString()) return parsed;

  return 604800;
};
