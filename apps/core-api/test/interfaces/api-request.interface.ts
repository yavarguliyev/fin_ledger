export interface ApiRequest {
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
  path: string;
  token?: string;
  body?: unknown;
  clientIp?: string;
  cookie?: string;
  deviceId?: string;
}
