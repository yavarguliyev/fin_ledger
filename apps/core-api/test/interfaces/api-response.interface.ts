export interface ApiResponse<T = unknown> {
  status: number;
  headers: Headers;
  body: T;
}
