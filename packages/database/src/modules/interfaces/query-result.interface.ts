export interface QueryResult<T = unknown> {
  readonly rowCount: number;
  readonly rows: T[];
}
