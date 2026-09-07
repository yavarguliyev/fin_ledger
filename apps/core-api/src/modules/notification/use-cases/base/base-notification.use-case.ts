import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class NotificationBaseUseCase<TInput, TOutput> {
  protected abstract execute(input: TInput): Promise<TOutput>;
}
