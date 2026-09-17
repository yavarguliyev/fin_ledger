export abstract class GameBaseHandlerUseCase<TInput, TOutput> {
  protected abstract execute(input: TInput): Promise<TOutput>;
}
