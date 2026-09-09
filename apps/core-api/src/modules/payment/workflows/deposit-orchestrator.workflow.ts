import { Injectable } from '@nestjs/common';
import { WorkflowNames, WorkflowOrchestratorService, WorkflowStep } from '@common/libs';

import { ValidatePaymentMethodStep } from './steps/validate-payment-method.step';
import { ReserveFundsStep } from './steps/reserve-funds.step';
import { CreatePaymentRecordStep } from './steps/create-payment-record.step';
import { CreditWalletStep } from './steps/credit-wallet.step';
import { EmitPaymentEventStep } from './steps/emit-payment-event.step';
import { DepositContextDto, DepositWorkflowInput } from '../dtos/payment/deposit-context.dto';

@Injectable()
export class DepositOrchestratorWorkflow extends WorkflowOrchestratorService<DepositWorkflowInput, DepositContextDto> {
  protected override readonly workflowName: WorkflowNames = 'PaymentDepositOrchestratorWorkflow';

  constructor (
    private readonly validatePaymentMethodStep: ValidatePaymentMethodStep,
    private readonly reserveFundsStep: ReserveFundsStep,
    private readonly createPaymentRecordStep: CreatePaymentRecordStep,
    private readonly creditWalletStep: CreditWalletStep,
    private readonly emitPaymentEventStep: EmitPaymentEventStep
  ) {
    super();
  }

  protected buildContext ({ userId, dto }: DepositWorkflowInput): DepositContextDto {
    return { userId, dto };
  }

  protected getSteps (): WorkflowStep<DepositContextDto>[] {
    return [this.validatePaymentMethodStep, this.reserveFundsStep, this.createPaymentRecordStep, this.creditWalletStep, this.emitPaymentEventStep];
  }
}
