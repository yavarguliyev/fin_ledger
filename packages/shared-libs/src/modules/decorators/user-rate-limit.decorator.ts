import { UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

export const UserRateLimit = (): MethodDecorator & ClassDecorator => UseGuards(ThrottlerGuard);
