export abstract class NotificationBaseUseCase<TInput, TOutput> {
  protected abstract execute(input: TInput): Promise<TOutput>;
}
