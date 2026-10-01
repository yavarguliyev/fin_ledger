import { BackoffDto } from '../dtos/queue/backoff.dto';
import { JOB } from '../constants/jobs/job.constant';

export class JobBackoffHelper {
  static delayMs ({ attempts }: BackoffDto): number {
    const delay = JOB.BACKOFF_BASE_MS * JOB.BACKOFF_FACTOR ** Math.max(attempts - 1, 0);
    return Math.min(delay, JOB.BACKOFF_MAX_MS);
  }
}
