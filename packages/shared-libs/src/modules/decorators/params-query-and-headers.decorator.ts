import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { UnknownRecord } from '../types/base.type';

export const ParamsQueryAndHeaders = createParamDecorator((_data: unknown, ctx: ExecutionContext): UnknownRecord => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const params = request.params as UnknownRecord;
  const query = request.query as UnknownRecord;
  const headers = request.headers as UnknownRecord;
  const body = request.body as UnknownRecord;

  return { ...params, ...query, ...headers, ...body };
});
