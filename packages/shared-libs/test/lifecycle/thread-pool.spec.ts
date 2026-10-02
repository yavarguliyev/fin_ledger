import { ThreadPool } from '../../src/modules/lifecycle/thread-pool';
import { THREAD_POOL_SPEC as T } from '../constants/thread-pool.constant';

describe('ThreadPool.configure', () => {
  it('keeps an explicit UV_THREADPOOL_SIZE', () => {
    const env: NodeJS.ProcessEnv = { [T.KEY]: T.EXPLICIT };

    expect(ThreadPool.configure({ env, cpus: T.MID_MACHINE })).toBe(T.EXPLICIT_SIZE);
    expect(env[T.KEY]).toBe(T.EXPLICIT);
  });

  it('sizes the pool to the CPUs, never below the libuv default or above the cap', () => {
    expect(ThreadPool.configure({ env: {}, cpus: T.SMALL_MACHINE })).toBe(T.MIN);
    expect(ThreadPool.configure({ env: {}, cpus: T.MID_MACHINE })).toBe(T.MID_MACHINE);
    expect(ThreadPool.configure({ env: {}, cpus: T.BIG_MACHINE })).toBe(T.MAX);
  });

  it('ignores a value that is not a positive number and writes the chosen size back', () => {
    const env: NodeJS.ProcessEnv = { [T.KEY]: T.INVALID };

    expect(ThreadPool.configure({ env, cpus: T.MID_MACHINE })).toBe(T.MID_MACHINE);
    expect(env[T.KEY]).toBe(String(T.MID_MACHINE));
  });
});
