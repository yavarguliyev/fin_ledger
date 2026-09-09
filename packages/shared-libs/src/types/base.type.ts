import {
  ACTION_EVENTS,
  AGGREGATE_TYPES,
  BETTING_TYPES,
  CACHE_KEYS,
  CACHE_TTLS,
  FLOW_DIRECTIONS,
  JOIN_CLAUSE_TYPES,
  MODULES_KEYS,
  OPERATORS,
  ORDER_DIRECTIONS,
  RABBITMQ_KEYS,
  STORAGE_STRATEGIES,
  TOKEN_TYPES,
  WALLET_STATUS,
  WORKFLOW_NAMES,
  WORKFLOW_STEPS
} from '../constants/shared.constant';
import { WorkflowStepStatus } from '../enums/common/events.enum';

export type UnknownRecord = Record<string, unknown>;
export type EntityId = string | number;
export type EntityData = UnknownRecord;
export type Topic = string | RegExp;
export type RemoveUndefined<T> = { [K in keyof T]: Exclude<T[K], undefined> };

export type AsyncMethod = (...args: unknown[]) => Promise<unknown>;
export type HandleRecord = (payload: UnknownRecord) => Promise<void>;
export type MessageHandler<T = unknown> = (payload: T) => Promise<void> | void;
export type HeadersPayload = Record<string, string | Buffer | (string | Buffer)[]>;

export type StorageStrategy = (typeof STORAGE_STRATEGIES)[number];
export type ActionEvent = (typeof ACTION_EVENTS)[number];
export type AggregateType = (typeof AGGREGATE_TYPES)[number];
export type BettingType = (typeof BETTING_TYPES)[number];
export type TokenType = (typeof TOKEN_TYPES)[number];
export type FlowDirection = (typeof FLOW_DIRECTIONS)[number];
export type Operators = (typeof OPERATORS)[number];
export type JoinClauseTypes = (typeof JOIN_CLAUSE_TYPES)[number];
export type OrderDirection = (typeof ORDER_DIRECTIONS)[number];

export type WhereCondition = { readonly field: string; readonly value: unknown; readonly operator?: Operators };

export type CacheKey = (typeof CACHE_KEYS)[number];
export type CacheTTL = (typeof CACHE_TTLS)[number];
export type UserWalletStatus = (typeof WALLET_STATUS)[number];
export type RabbitmqRegistry = Record<string, { key: (typeof RABBITMQ_KEYS)[number] }>;
export type ModuleRegistry = Record<string, { key: (typeof MODULES_KEYS)[number] }>;

export type WorkflowNames = (typeof WORKFLOW_NAMES)[number];
export type WorkflowSteps = (typeof WORKFLOW_STEPS)[number];
export type WorkflowContext = Record<string, unknown>;
export type WorkflowExecutionRecord = { readonly stepName: string; readonly status: WorkflowStepStatus };
