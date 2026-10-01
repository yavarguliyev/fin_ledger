import type { ClaimedJobDto } from '../dtos/queue/claimed-job.dto';

export interface JobError {
  job: ClaimedJobDto;
  message: string;
}
