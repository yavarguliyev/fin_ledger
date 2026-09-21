import { Injectable } from '@nestjs/common';
import { WorkflowNames, WorkflowOrchestratorService, WorkflowStep } from '@common/libs';

import { ValidatePaymentMethodStep } from './steps/validate-payment-method.step';
import { CreatePaymentRecordStep } from './steps/create-payment-record.step';
import { ChargePaymentStep } from './steps/charge-payment.step';
import { CreditWalletStep } from './steps/credit-wallet.step';
import { EmitPaymentEventStep } from './steps/emit-payment-event.step';
import { DepositContextDto } from '../dtos/workflow/deposit-context.dto';
import { DepositWorkflowInputDto } from '../dtos/workflow/deposit-workflow-input.dto';

@Injectable()
export class DepositOrchestratorWorkflow extends WorkflowOrchestratorService<DepositWorkflowInputDto, DepositContextDto> {
  protected override readonly workflowName: WorkflowNames = 'PaymentDepositOrchestratorWorkflow';

  constructor (
    private readonly validatePaymentMethodStep: ValidatePaymentMethodStep,
    private readonly createPaymentRecordStep: CreatePaymentRecordStep,
    private readonly chargePaymentStep: ChargePaymentStep,
    private readonly creditWalletStep: CreditWalletStep,
    private readonly emitPaymentEventStep: EmitPaymentEventStep
  ) {
    super();
  }

  protected buildContext ({ userId, dto }: DepositWorkflowInputDto): DepositContextDto {
    return { userId, dto };
  }

  protected getSteps (): WorkflowStep<DepositContextDto>[] {
    return [
      this.validatePaymentMethodStep,
      this.createPaymentRecordStep,
      this.chargePaymentStep,
      this.creditWalletStep,
      this.emitPaymentEventStep
    ];
  }
}
