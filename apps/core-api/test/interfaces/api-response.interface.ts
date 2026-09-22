export interface ApiResponse<T = unknown> {
  status: number;
  body: T;
}
