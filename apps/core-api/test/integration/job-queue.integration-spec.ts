import { JOBS_TEST } from '../constants/jobs.constant';
import { DbHelper } from '../helpers/db.helper';
import { JobRow } from '../interfaces/job-row.interface';

const enqueue = async (dedupeKey: string | null = null): Promise<string | undefined> => {
  const rows = await DbHelper.query<{ id: string }>({
    sql: JOBS_TEST.ENQUEUE_SQL,
    params: [JOBS_TEST.NAME, JSON.stringify({ scope: 'all' }), JOBS_TEST.MAX_ATTEMPTS, dedupeKey]
  });

  return rows[0]?.id;
};

const claim = (): Promise<JobRow[]> => DbHelper.query<JobRow>({ sql: JOBS_TEST.CLAIM_SQL, params: [JOBS_TEST.BATCH, JOBS_TEST.NAME] });

const statusOf = async (jobId: string): Promise<{ status: string; attempts: number } | undefined> => {
  const [row] = await DbHelper.query<{ status: string; attempts: number }>({ sql: JOBS_TEST.STATUS_SQL, params: [jobId] });

  return row;
};

const countJobs = async (): Promise<number> => {
  const [row] = await DbHelper.query<{ count: number }>({ sql: JOBS_TEST.COUNT_SQL, params: [JOBS_TEST.NAME] });

  return row?.count ?? 0;
};

beforeEach(async () => {
  await DbHelper.query({ sql: JOBS_TEST.CLEAN_SQL, params: [JOBS_TEST.NAME] });
});

afterAll(async () => {
  await DbHelper.query({ sql: JOBS_TEST.CLEAN_SQL, params: [JOBS_TEST.NAME] });
  await DbHelper.close();
});

describe('Durable job queue', () => {
  it('never runs a job whose transaction rolled back, and runs a committed one exactly once', async () => {
    await DbHelper.query({ sql: 'BEGIN' });
    await enqueue();
    await DbHelper.query({ sql: 'ROLLBACK' });

    await expect(countJobs()).resolves.toBe(0);

    const committed = await enqueue();
    expect(committed).toEqual(expect.any(String) as string);

    const first = await claim();
    const second = await claim();

    expect(first.filter(({ id }) => id === committed)).toHaveLength(1);
    expect(second.filter(({ id }) => id === committed)).toHaveLength(0);
  });

  it('keeps one open job per dedupe key, so the same work is not queued twice', async () => {
    const first = await enqueue(JOBS_TEST.DEDUPE_KEY);
    const second = await enqueue(JOBS_TEST.DEDUPE_KEY);

    expect(first).toEqual(expect.any(String) as string);
    expect(second).toBeUndefined();
    await expect(countJobs()).resolves.toBe(1);
  });

  it('counts the attempt when it claims, so a crashed worker cannot retry for ever', async () => {
    const jobId = (await enqueue()) as string;

    await claim();

    await expect(statusOf(jobId)).resolves.toEqual({ status: JOBS_TEST.RUNNING, attempts: 1 });
  });

  it('buries a job that used up its attempts and lets it be replayed', async () => {
    const jobId = (await enqueue()) as string;

    await DbHelper.query({ sql: JOBS_TEST.BURY_SQL, params: [jobId, JOBS_TEST.FAILURE] });
    await expect(statusOf(jobId)).resolves.toMatchObject({ status: JOBS_TEST.DEAD });

    const replayed = await DbHelper.query<{ id: string }>({ sql: JOBS_TEST.REPLAY_SQL, params: [jobId] });

    expect(replayed).toHaveLength(1);
    await expect(statusOf(jobId)).resolves.toEqual({ status: JOBS_TEST.PENDING, attempts: 0 });
  });
});

describe('Durable job queue: replays', () => {
  it('refuses to replay a job that is not dead', async () => {
    const jobId = (await enqueue()) as string;

    const replayed = await DbHelper.query<{ id: string }>({ sql: JOBS_TEST.REPLAY_SQL, params: [jobId] });

    expect(replayed).toHaveLength(0);
  });
});
