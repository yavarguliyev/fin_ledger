import { SelfExclusionPeriod } from '@common/libs';

export const SELF_EXCLUSION = {
  PERIOD_DAYS: {
    [SelfExclusionPeriod.DAY_1]: 1,
    [SelfExclusionPeriod.DAYS_7]: 7,
    [SelfExclusionPeriod.DAYS_30]: 30,
    [SelfExclusionPeriod.MONTHS_6]: 183
  },
  PERMANENT_YEARS: 100,
  DAYS_PER_YEAR: 366,
  MS_PER_DAY: 86_400_000,
  BLOCKED_MESSAGE: 'You have self-excluded from gambling. This cannot be lifted before it expires.',
  SHORTEN_MESSAGE: 'A self-exclusion can only be extended, never shortened or cancelled',
  ALREADY_LONGER_MESSAGE: 'Your current self-exclusion already runs longer than that',
  STARTED_MESSAGE: 'Your self-exclusion is in place.',
  EMAIL: {
    SUBJECT: 'Your self-exclusion is in place',
    PURPOSE: 'Self-Exclusion',
    TITLE: 'Your self-exclusion is in place',
    BODY: 'You will not be able to place bets or deposit until it expires. It cannot be lifted early, by you or by us. Withdrawals stay available.'
  },
  PROFILE_PATH: '/profile'
} as const;
