import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseHelper, PaymentCapability, PaymentProviderRegistry, ProviderChargeStatus } from '@common/libs';

import { PaymentRepository } from '../repositories/payment.repository';
import { CompletePaymentUseCase } from '../use-cases/commands/complete-payment.use-case';
import { FailPaymentUseCase } from '../use-cases/commands/fail-payment.use-case';
import { PaymentRefDto } from '../dtos/helper/payment-ref.dto';
import { PAYMENT_RECONCILIATION } from '../constants/jobs/payment-reconciliation.constant';

/**
 * Finishes deposits the provider settled but whose webhook never arrived: deposits left PROCESSING or REQUIRES_ACTION
 * longer than a threshold are looked up at the provider and completed or failed through the same use cases as the
 * webhook. Payments the provider still reports as open are left alone.
 */
@Injectable()
export class PaymentReconciliationJob implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(PaymentReconciliationJob.name);
  private readonly intervalMs: number;
  private readonly staleAfterMs: number;
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
  }

  onApplicationBootstrap (): void {
    this.intervalHandle = setInterval(() => void this.tick(), this.intervalMs);
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
      limit: PAYMENT_RECONCILIATION.BATCH_SIZE
    });

    for (const payment of payments) {
      if (this.stopped) return;
      await this.reconcile({ payment }).catch((error: unknown) =>
        this.logger.warn(`Reconciliation of payment ${payment.id} failed: ${BaseHelper.errorResponse({ error }).message}`)
      );
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

  private async reconcile ({ payment }: PaymentRefDto): Promise<void> {
    if (!payment.provider || !payment.providerChargeId) return;

    const provider = this.providerRegistry.require({ providerName: payment.provider, capability: PaymentCapability.CHARGE });
    const charge = await provider.retrieveCharge({ chargeId: payment.providerChargeId });

    if (charge.status === ProviderChargeStatus.SUCCEEDED) {
      await this.completePayment.execute({ paymentId: payment.id });
      return;
    }

    if (charge.status === ProviderChargeStatus.FAILED) {
      await this.failPayment.execute({
        paymentId: payment.id,
        ...(charge.failureReason && { failureReason: charge.failureReason }),
        ...(charge.failure && { failureCode: charge.failure.code })
      });
    }
  }
}
