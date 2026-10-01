import type { ClaimedJobDto } from '../dtos/queue/claimed-job.dto';

export interface JobRef {
  job: ClaimedJobDto;
}
