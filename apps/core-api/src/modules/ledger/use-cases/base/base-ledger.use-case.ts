export abstract class LedgerBaseUseCase<TInput, TOutput> {
  protected abstract execute(input: TInput): Promise<TOutput>;
}
