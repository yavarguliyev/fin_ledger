import { Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ENVIRONMENT_CONSTANTS,
  RequestContext,
  SessionGuard,
  RolesGuard,
  Roles,
  UserRoles,
  ParamsQueryAndHeaders,
  SetupSessionResultDto,
  Audited
} from '@common/libs';

import { PaymentMethodService } from './payment-method.service';
import { PaymentMethodDto } from './dtos/payment-method/payment-method.dto';
import { CreateSetupSessionRequestDto, CreateSetupSessionRequestSchema } from './dtos/request/create-setup-session-request.dto';
import { ConfirmSetupSessionRequestDto, ConfirmSetupSessionRequestSchema } from './dtos/request/confirm-setup-session-request.dto';
import { ListPaymentMethodsRequestDto, ListPaymentMethodsRequestSchema } from './dtos/request/list-payment-methods-request.dto';
import { PaymentMethodIdRequestDto, PaymentMethodIdRequestSchema } from './dtos/request/payment-method-id-request.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/modules/shared.constant';

@ApiTags(SHARED_CONSTANTS.PAYMENT_METHOD.key)
@ApiBearerAuth('bearer')
@UseGuards(SessionGuard, RolesGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.PAYMENT_METHOD, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class PaymentMethodController {
  constructor (private readonly paymentMethodService: PaymentMethodService) {}

  @Post(':provider/session')
  @Roles({ roles: [UserRoles.USER] })
  async createSetupSession (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: CreateSetupSessionRequestSchema }) dto: CreateSetupSessionRequestDto
  ): Promise<SetupSessionResultDto> {
    return this.paymentMethodService.createSetupSession({ ...dto, email: req.user.email });
  }

  @Post(':provider/confirm')
  @Roles({ roles: [UserRoles.USER] })
  async confirmSetupSession (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ConfirmSetupSessionRequestSchema }) dto: ConfirmSetupSessionRequestDto
  ): Promise<PaymentMethodDto> {
    return this.paymentMethodService.confirmSetupSession({ ...dto, userId: req.user.userId });
  }

  @Get()
  async listPaymentMethods (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ListPaymentMethodsRequestSchema }) dto: ListPaymentMethodsRequestDto
  ): Promise<PaymentMethodDto[]> {
    return this.paymentMethodService.listPaymentMethods({ ...dto, userId: req.user.userId });
  }

  @Post(':id/verify')
  @Roles({ roles: [UserRoles.USER] })
  @Audited({ action: 'PAYMENT_METHOD_VERIFIED', entityType: 'PaymentMethod', entityIdParam: 'id' })
  async verifyPaymentMethod (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: PaymentMethodIdRequestSchema }) dto: PaymentMethodIdRequestDto
  ): Promise<PaymentMethodDto> {
    return this.paymentMethodService.verifyPaymentMethod({ ...dto, userId: req.user.userId });
  }

  @Get(':id')
  async getPaymentMethod (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: PaymentMethodIdRequestSchema }) dto: PaymentMethodIdRequestDto
  ): Promise<PaymentMethodDto> {
    return this.paymentMethodService.getPaymentMethod({ ...dto, userId: req.user.userId });
  }

  @Delete(':id')
  @Roles({ roles: [UserRoles.USER] })
  @Audited({ action: 'PAYMENT_METHOD_REMOVED', entityType: 'PaymentMethod', entityIdParam: 'id' })
  async removePaymentMethod (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: PaymentMethodIdRequestSchema }) dto: PaymentMethodIdRequestDto
  ): Promise<PaymentMethodDto> {
    return this.paymentMethodService.removePaymentMethod({ ...dto, userId: req.user.userId });
  }
}
