import { Injector, runInInjectionContext } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { HttpRequestError } from '../../src/app/core/errors/http-request.error';
import { PaymentMethod } from '../../src/app/core/types/payment-method/payment-method.type';
import { PaymentMethodService } from '../../src/app/core/services/payment-method.service';
import { WithdrawMethodsService } from '../../src/app/features/wallet/services/withdraw-methods.service';
import { WITHDRAW_METHODS_TEST as T } from '../constants/withdraw-methods.constant';
import { aPaymentMethod } from '../fakes/payment-method.fake';

const list = jest.fn<Observable<PaymentMethod[]>, []>();
const create = (): WithdrawMethodsService =>
  runInInjectionContext(Injector.create({ providers: [{ provide: PaymentMethodService, useValue: { list } }] }), () => new WithdrawMethodsService());

describe('Payment methods for a withdrawal', () => {
  it('reports a failed load as an error, not as having no methods, and recovers on retry', () => {
    const methods = create();
    list.mockReturnValue(throwError(() => new HttpRequestError({ message: T.MESSAGE, status: T.STATUS })));
    methods.load().subscribe({ error: () => undefined });

    expect(methods.failed()).toBe(true);
    expect(methods.loading()).toBe(false);

    list.mockReturnValue(of([aPaymentMethod({ status: T.VERIFIED }), aPaymentMethod({ status: T.PENDING })]));
    methods.load().subscribe();

    expect(methods.failed()).toBe(false);
    expect(methods.verified()).toHaveLength(1);
  });
});
