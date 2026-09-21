import { Request } from 'express';

import { SessionData } from './session-data.interface';

export interface RequestContext extends Request {
  user: SessionData;
}
