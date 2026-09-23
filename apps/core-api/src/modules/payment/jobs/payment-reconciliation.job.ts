import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseHelper, PaymentCapability, PaymentProviderRegistry, ProviderChargeStatus , RequestScope } from '@common/libs';

import { PaymentRepository } from '../repositories/payment.repository';
import { CompletePaymentUseCase } from '../use-cases/commands/complete-payment.use-case';
import { FailPaymentUseCase } from '../use-cases/commands/fail-payment.use-case';
import { PaymentRefDto } from '../dtos/helper/payment-ref.dto';
import { PAYMENT_RECONCILIATION } from '../constants/jobs/payment-reconciliation.constant';
import { PAYMENT_METADATA_KEYS } from '../constants/operations/payment-metadata.constant';
import { PAYMENT_FAILURE_REASONS } from '../constants/operations/payment-failure-reasons.constant';
import { PAYMENT_FAILURE_CODES } from '../constants/operations/payment-failure-codes.constant';
import { SettleReconciledPaymentDto } from '../dtos/helper/settle-reconciled-payment.dto';

@Injectable()
export class PaymentReconciliationJob implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(PaymentReconciliationJob.name);
  private readonly intervalMs: number;
  private readonly staleAfterMs: number;
  private readonly actionExpiryMs: number;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private running = false;
  private stopped = false;

  constructor (
    configService: ConfigService,
    private readonly paymentRepository: PaymentRepository,
    private readonly providerRegistry: PaymentProviderRegistry,
    private readonly completePayment: CompletePaymentUseCase,
    private readonly failPayment: FailPaymentUseCase
  ) {
    this.intervalMs = configService.get<number>('PAYMENT_RECONCILE_INTERVAL_MS') ?? PAYMENT_RECONCILIATION.DEFAULT_INTERVAL_MS;
    this.staleAfterMs = configService.get<number>('PAYMENT_RECONCILE_STALE_AFTER_MS') ?? PAYMENT_RECONCILIATION.DEFAULT_STALE_AFTER_MS;
    this.actionExpiryMs = configService.get<number>('PAYMENT_ACTION_EXPIRY_MS') ?? PAYMENT_RECONCILIATION.DEFAULT_ACTION_EXPIRY_MS;
  }

  onApplicationBootstrap (): void {
    this.intervalHandle = setInterval(() => void RequestScope.runSystem(() => this.tick()), this.intervalMs);
    this.intervalHandle.unref();
  }

  onModuleDestroy (): void {
    this.stopped = true;

    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.intervalHandle = null;
  }

  async reconcileStalePayments (): Promise<void> {
    const payments = await this.paymentRepository.findStaleOpenDeposits({
      updatedBefore: new Date(Date.now() - this.staleAfterMs).toISOString(),
      maxAttempts: PAYMENT_RECONCILIATION.MAX_ATTEMPTS,
      limit: PAYMENT_RECONCILIATION.BATCH_SIZE
    });

    for (const payment of payments) {
      if (this.stopped) return;
      const resolved = await this.reconcile({ payment }).catch((error: unknown) => {
        this.logger.warn(`Reconciliation of payment ${payment.id} failed: ${BaseHelper.errorResponse({ error }).message}`);
        return false;
      });

      if (!resolved) await this.recordUnresolved({ payment });
    }
  }

  private async tick (): Promise<void> {
    if (this.stopped || this.running) return;

    this.running = true;

    try {
      await this.reconcileStalePayments();
    } catch (error) {
      this.logger.warn(`Payment reconciliation skipped: ${BaseHelper.errorResponse({ error }).message}`);
    } finally {
      this.running = false;
    }
  }

  private async recordUnresolved ({ payment }: PaymentRefDto): Promise<void> {
    const updated = await this.paymentRepository.recordReconcileAttempt({ id: payment.id });
    if (updated?.reconcileAttempts === PAYMENT_RECONCILIATION.MAX_ATTEMPTS) this.logger.error(`Payment ${payment.id} needs manual review: still unresolved after ${PAYMENT_RECONCILIATION.MAX_ATTEMPTS} reconciliation attempts`);
  }

  private async reconcile ({ payment }: PaymentRefDto): Promise<boolean> {
    if (!payment.provider) return false;

    const provider = this.providerRegistry.require({ providerName: payment.provider, capability: PaymentCapability.CHARGE });
    if (payment.providerChargeId) {
      const chargeId = payment.providerChargeId;
      const charge = await provider.retrieveCharge({ chargeId });
      const abandoned = charge.status === ProviderChargeStatus.REQUIRES_ACTION && this.isActionExpired({ payment });

      return this.settle({ payment, charge: abandoned ? await provider.cancelCharge({ chargeId }) : charge });
    }

    const charge = await provider.findChargeByMetadata({ key: PAYMENT_METADATA_KEYS.PAYMENT_ID, value: payment.id });
    if (!charge) {
      await this.failPayment.execute({
        paymentId: payment.id,
        failureReason: PAYMENT_FAILURE_REASONS.NOT_FOUND_AT_PROVIDER,
        failureCode: PAYMENT_FAILURE_CODES.NOT_FOUND_AT_PROVIDER
      });
      return true;
    }

    if (charge.status === ProviderChargeStatus.INDETERMINATE) return false;

    await this.paymentRepository.attachChargeId({ paymentId: payment.id, providerChargeId: charge.chargeId });
    return this.settle({ payment, charge });
  }

  private isActionExpired ({ payment }: PaymentRefDto): boolean {
    return Date.now() - new Date(payment.createdAt).getTime() > this.actionExpiryMs;
  }

  private async settle ({ payment, charge }: SettleReconciledPaymentDto): Promise<boolean> {
    if (charge.status === ProviderChargeStatus.SUCCEEDED) {
      await this.completePayment.execute({ paymentId: payment.id });
      return true;
    }

    if (charge.status !== ProviderChargeStatus.FAILED) return false;

    await this.failPayment.execute({
      paymentId: payment.id,
      ...(charge.failureReason && { failureReason: charge.failureReason }),
      ...(charge.failure && { failureCode: charge.failure.code })
    });
    return true;
  }
}
