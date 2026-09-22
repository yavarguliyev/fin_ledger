export interface ApiRequest {
  method?: 'GET' | 'PATCH' | 'POST';
  path: string;
  token?: string;
  body?: unknown;
  clientIp?: string;
}
