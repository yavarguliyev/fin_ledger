export abstract class WalletTransactionsBaseUseCase<TInput, TOutput> {
  protected abstract execute(input: TInput): Promise<TOutput>;
}
