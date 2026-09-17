import { RequestContext } from '../interfaces/session.interface';

export type HashParams = { password: string };

export type CompareParams = { password: string; passwordHash: string };

export type GetSessionUserParams = { context: RequestContext };

export type ParseExpiryToSecondsParams = { expiry: string };
