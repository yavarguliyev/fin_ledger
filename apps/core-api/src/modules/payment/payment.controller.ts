import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, RequestContext, SessionGuard, RolesGuard, Roles, UserRoles } from '@common/libs';

import { PaymentService } from './payment.service';
import { RequestPaymentDto } from './dtos/request/request-payment.dto';
import { PaymentDto } from './dtos/payment/payment.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/shared.constant';

@ApiTags(SHARED_CONSTANTS.PAYMENT.key)
@UseGuards(SessionGuard, RolesGuard)
@Roles(UserRoles.USER)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.PAYMENT, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class PaymentController {
  constructor (private readonly paymentService: PaymentService) {}

  @Post('deposit')
  async requestDeposit (@Req() req: RequestContext, @Body() dto: RequestPaymentDto): Promise<PaymentDto> {
    return this.paymentService.deposit(req, dto);
  }

  @Post('withdraw')
  async requestWithdrawal (@Req() req: RequestContext, @Body() dto: RequestPaymentDto): Promise<PaymentDto> {
    return this.paymentService.withdraw(req, dto);
  }

  @Roles(UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR, UserRoles.USER)
  @Get(':id')
  async findPaymentById (@Param('id') id: string): Promise<PaymentDto> {
    return this.paymentService.getPayment(id);
  }
}
