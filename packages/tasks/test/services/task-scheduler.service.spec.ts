import { PostgresService } from '@common/database';

import { TaskSchedulerService } from '../../src/modules/services/task-scheduler.service';
import { TASK_TEST } from '../constants/task.constant';

describe('TaskSchedulerService', () => {
  let scheduler: TaskSchedulerService;
  let tick: jest.SpyInstance;
  const run = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    scheduler = new TaskSchedulerService({} as PostgresService);
    tick = jest.spyOn(scheduler, 'tick').mockResolvedValue(true);
  });

  afterEach(() => {
    scheduler.stop();
    jest.useRealTimers();
  });

  it('keeps a schedule registered before start idle until the runner starts it', () => {
    scheduler.schedule({ name: TASK_TEST.NAME, everyMs: TASK_TEST.POLL_MS, run });
    jest.advanceTimersByTime(TASK_TEST.POLL_MS * 3);
    expect(tick).not.toHaveBeenCalled();

    scheduler.start();
    jest.advanceTimersByTime(TASK_TEST.POLL_MS);
    expect(tick).toHaveBeenCalledTimes(1);
  });

  it('arms a schedule added after start straight away, once per name', () => {
    scheduler.start();
    scheduler.schedule({ name: TASK_TEST.NAME, everyMs: TASK_TEST.POLL_MS, run });
    scheduler.schedule({ name: TASK_TEST.NAME, everyMs: TASK_TEST.POLL_MS, run });
    jest.advanceTimersByTime(TASK_TEST.POLL_MS);

    expect(tick).toHaveBeenCalledTimes(1);
  });

  it('stops every timer once stopped', () => {
    scheduler.schedule({ name: TASK_TEST.NAME, everyMs: TASK_TEST.POLL_MS, run });
    scheduler.schedule({ name: TASK_TEST.OTHER_NAME, everyMs: TASK_TEST.POLL_MS, run });
    scheduler.start();
    scheduler.stop();
    jest.advanceTimersByTime(TASK_TEST.POLL_MS * 3);

    expect(tick).not.toHaveBeenCalled();
  });
});
