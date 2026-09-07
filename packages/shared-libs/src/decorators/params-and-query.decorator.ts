import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UnknownRecord } from '../types/base.type';

export const ParamsAndQuery = createParamDecorator((_data: unknown, ctx: ExecutionContext): UnknownRecord => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return { ...request.params, ...request.query };
});
