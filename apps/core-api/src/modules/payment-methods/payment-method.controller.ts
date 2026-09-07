import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, PaymentMethodStatus, RequestContext, SessionGuard, RolesGuard, Roles, UserRoles } from '@common/libs';

import { PaymentMethodService } from './payment-method.service';
import { CreatePaymentMethodDto } from './dtos/request/create-payment-method.dto';
import { PaymentMethodDto } from './dtos/payment-method/payment-method.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/shared.constant';

@ApiTags(SHARED_CONSTANTS.PAYMENT_METHOD.key)
@ApiBearerAuth('bearer')
@UseGuards(SessionGuard, RolesGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.PAYMENT_METHOD, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class PaymentMethodController {
  constructor (private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  @Roles(UserRoles.USER)
  async createPaymentMethod (@Req() req: RequestContext, @Body() dto: CreatePaymentMethodDto): Promise<PaymentMethodDto> {
    return this.paymentMethodService.createPaymentMethod(req.user.userId, dto);
  }

  @Get()
  async listPaymentMethods (@Req() req: RequestContext, @Query('status') status?: PaymentMethodStatus): Promise<PaymentMethodDto[]> {
    return this.paymentMethodService.listPaymentMethods(req.user.userId, status);
  }

  @Post(':id/verify')
  @Roles(UserRoles.USER)
  async verifyPaymentMethod (@Req() req: RequestContext, @Param('id') id: string): Promise<PaymentMethodDto> {
    return this.paymentMethodService.verifyPaymentMethod(id, req.user.userId);
  }

  @Get(':id')
  async getPaymentMethod (@Req() req: RequestContext, @Param('id') id: string): Promise<PaymentMethodDto> {
    return this.paymentMethodService.getPaymentMethod(id, req.user.userId);
  }

  @Delete(':id')
  @Roles(UserRoles.USER)
  async removePaymentMethod (@Req() req: RequestContext, @Param('id') id: string): Promise<PaymentMethodDto> {
    return this.paymentMethodService.removePaymentMethod(id, req.user.userId);
  }
}
