import { TaskWorkerService } from '../../src/modules/services/task-worker.service';
import { JobRepository } from '../../src/modules/repositories/job.repository';
import { TaskRegistry } from '../../src/modules/services/task-registry.service';
import { TASK_TEST } from '../constants/task.constant';

describe('TaskWorkerService', () => {
  let claim: jest.Mock;
  let worker: TaskWorkerService;

  beforeEach(() => {
    jest.useFakeTimers();
    claim = jest.fn().mockResolvedValue([]);
    const repository = { claim } as unknown as JobRepository;
    const options = { pollMs: TASK_TEST.POLL_MS, batchSize: TASK_TEST.BATCH_SIZE };
    worker = new TaskWorkerService(options, repository, {} as TaskRegistry);
  });

  afterEach(() => {
    worker.onModuleDestroy();
    jest.useRealTimers();
  });

  it('does not poll when started before the application has bootstrapped', () => {
    worker.start();
    jest.advanceTimersByTime(TASK_TEST.POLL_MS * 3);

    expect(claim).not.toHaveBeenCalled();
  });

  it('begins polling once the application bootstraps after an early start', () => {
    worker.start();
    worker.onApplicationBootstrap();
    jest.advanceTimersByTime(TASK_TEST.POLL_MS);

    expect(claim).toHaveBeenCalledWith({ size: TASK_TEST.BATCH_SIZE });
  });

  it('polls immediately on start when the application has already bootstrapped', () => {
    worker.onApplicationBootstrap();
    worker.start();
    jest.advanceTimersByTime(TASK_TEST.POLL_MS);

    expect(claim).toHaveBeenCalledTimes(1);
  });

  it('never polls when bootstrapped but not started', () => {
    worker.onApplicationBootstrap();
    jest.advanceTimersByTime(TASK_TEST.POLL_MS * 3);

    expect(claim).not.toHaveBeenCalled();
  });
});
