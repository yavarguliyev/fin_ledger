import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, RequestContext, SessionGuard, RolesGuard, Roles, UserRateLimit, UserRoles } from '@common/libs';

import { PaymentService } from './payment.service';
import { PaymentDto } from './dtos/payment/payment.dto';
import { PaymentResultDto } from './dtos/payment/payment-result.dto';
import { RequestPaymentDto, RequestPaymentSchema } from './dtos/request/request-payment.dto';
import { PaymentIdRequestDto, PaymentIdRequestSchema } from './dtos/request/payment-id-request.dto';
import { PaymentAccessGuard } from './guards/payment-access.guard';
import { SHARED_CONSTANTS } from '../../shared/constants/modules/shared.constant';

@ApiTags(SHARED_CONSTANTS.PAYMENT.key)
@UseGuards(SessionGuard, RolesGuard)
@Roles({ roles: [UserRoles.USER] })
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.PAYMENT, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class PaymentController {
  constructor (private readonly paymentService: PaymentService) {}

  @Post('deposit')
  @UserRateLimit()
  async requestDeposit (@Req() req: RequestContext, @Body({ schema: RequestPaymentSchema }) dto: RequestPaymentDto): Promise<PaymentResultDto> {
    return this.paymentService.deposit({ ...dto, userId: req.user.userId });
  }

  @Post('withdraw')
  @UserRateLimit()
  async requestWithdrawal (@Req() req: RequestContext, @Body({ schema: RequestPaymentSchema }) dto: RequestPaymentDto): Promise<PaymentResultDto> {
    return this.paymentService.withdraw({ ...dto, userId: req.user.userId });
  }

  @Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN] })
  @Get('unresolved')
  async listUnresolved (): Promise<PaymentDto[]> {
    return this.paymentService.listUnresolved();
  }

  @Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR, UserRoles.USER] })
  @Get(':id')
  @UseGuards(PaymentAccessGuard)
  async findPaymentById (@ParamsQueryAndHeaders({ schema: PaymentIdRequestSchema }) dto: PaymentIdRequestDto): Promise<PaymentDto> {
    return this.paymentService.getPayment(dto);
  }
}
