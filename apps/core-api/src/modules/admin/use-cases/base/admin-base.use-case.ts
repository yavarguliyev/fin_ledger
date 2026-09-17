export abstract class AdminBaseUseCase<TInput, TOutput> {
  abstract execute(input: TInput): TOutput | Promise<TOutput>;
}
