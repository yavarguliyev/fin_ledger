import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class LedgerBaseUseCase<TInput, TOutput> {
  protected abstract execute(input: TInput): Promise<TOutput>;
}
