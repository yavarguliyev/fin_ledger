import type { Request } from 'express';

export type RoutedRequest = Omit<Request, 'route'> & { route?: { path?: string } };
