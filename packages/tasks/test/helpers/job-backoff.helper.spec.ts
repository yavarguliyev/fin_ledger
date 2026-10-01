import { JobBackoffHelper } from '../../src/modules/helpers/job-backoff.helper';
import { TASK_TEST } from '../constants/task.constant';

describe('JobBackoffHelper', () => {
  it('waits the base delay on the first failure', () => {
    expect(JobBackoffHelper.delayMs({ attempts: TASK_TEST.FIRST_ATTEMPT })).toBe(TASK_TEST.BASE_MS);
  });

  it('doubles the wait on each further failure', () => {
    expect(JobBackoffHelper.delayMs({ attempts: TASK_TEST.SECOND_ATTEMPT })).toBe(TASK_TEST.BASE_MS * 2);
    expect(JobBackoffHelper.delayMs({ attempts: TASK_TEST.THIRD_ATTEMPT })).toBe(TASK_TEST.BASE_MS * 4);
  });

  it('stops growing at the cap, so a long-failing job is still retried on a sane schedule', () => {
    expect(JobBackoffHelper.delayMs({ attempts: TASK_TEST.HUGE_ATTEMPT })).toBe(TASK_TEST.MAX_MS);
  });

  it('treats a zero attempt count as the first failure rather than going negative', () => {
    expect(JobBackoffHelper.delayMs({ attempts: 0 })).toBe(TASK_TEST.BASE_MS);
  });
});
