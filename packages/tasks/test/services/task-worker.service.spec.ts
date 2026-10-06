import { TaskWorkerService } from '../../src/modules/services/task-worker.service';
import { TaskRegistry } from '../../src/modules/services/task-registry.service';
import { TASK_TEST } from '../constants/task.constant';
import { aJobRepository } from '../fakes/job-repository.fake';

describe('TaskWorkerService', () => {
  let claim: jest.Mock;
  let worker: TaskWorkerService;

  beforeEach(() => {
    jest.useFakeTimers();
    claim = jest.fn().mockResolvedValue([]);
    const repository = aJobRepository({ claim });
    const options = { pollMs: TASK_TEST.POLL_MS, batchSize: TASK_TEST.BATCH_SIZE };
    worker = new TaskWorkerService(options, repository, {} as TaskRegistry);
  });

  afterEach(() => {
    worker.stop();
    jest.useRealTimers();
  });

  it('never polls until the runner starts it', () => {
    jest.advanceTimersByTime(TASK_TEST.POLL_MS * 3);

    expect(claim).not.toHaveBeenCalled();
  });

  it('polls once per interval after start, with the configured batch size', () => {
    worker.start();
    worker.start();
    jest.advanceTimersByTime(TASK_TEST.POLL_MS);

    expect(claim).toHaveBeenCalledTimes(1);
    expect(claim).toHaveBeenCalledWith({ size: TASK_TEST.BATCH_SIZE });
  });

  it('stops polling once stopped', () => {
    worker.start();
    worker.stop();
    jest.advanceTimersByTime(TASK_TEST.POLL_MS * 3);

    expect(claim).not.toHaveBeenCalled();
  });
});
