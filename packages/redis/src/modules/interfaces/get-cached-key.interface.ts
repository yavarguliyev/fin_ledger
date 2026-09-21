export interface GetCachedKey<T> {
  readonly hit: boolean;
  readonly value: T | null;
}
