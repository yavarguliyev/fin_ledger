import { Inject, Injectable } from '@nestjs/common';
import { PostgresService } from '@common/database';

import { ClaimBatchDto } from '../dtos/queue/claim-batch.dto';
import { ClaimedJobDto } from '../dtos/queue/claimed-job.dto';
import { EnqueueTaskDto } from '../dtos/queue/enqueue-task.dto';
import { JobFailureDto } from '../dtos/queue/job-failure.dto';
import { JobIdDto } from '../dtos/queue/job-id.dto';
import { RescheduleJobDto } from '../dtos/queue/reschedule-job.dto';
import { JOB } from '../constants/jobs/job.constant';
import { JOB_SQL } from '../constants/jobs/job-sql.constant';

@Injectable()
export class JobRepository {
  constructor (@Inject(PostgresService) private readonly postgresService: PostgresService) {}

  async complete ({ jobId }: JobIdDto): Promise<void> {
    await this.postgresService.getWriteConnection().query({ sql: JOB_SQL.COMPLETE, params: [jobId] });
  }

  async reschedule ({ jobId, message, delayMs }: RescheduleJobDto): Promise<void> {
    await this.postgresService.getWriteConnection().query({ sql: JOB_SQL.RESCHEDULE, params: [jobId, message, delayMs] });
  }

  async bury ({ job, message }: JobFailureDto): Promise<void> {
    await this.postgresService.getWriteConnection().query({ sql: JOB_SQL.BURY, params: [job.id, message] });
  }

  async claim ({ size }: ClaimBatchDto): Promise<ClaimedJobDto[]> {
    const result = await this.postgresService.getWriteConnection().query<ClaimedJobDto>({ sql: JOB_SQL.CLAIM, params: [size] });
    return result.rows;
  }

  async replay ({ jobId }: JobIdDto): Promise<boolean> {
    const result = await this.postgresService.getWriteConnection().query<{ id: string }>({ sql: JOB_SQL.REPLAY, params: [jobId] });
    return result.rows.length > 0;
  }

  async enqueue ({ name, payload = {}, runAt, maxAttempts = JOB.DEFAULT_MAX_ATTEMPTS, dedupeKey, adapter }: EnqueueTaskDto): Promise<string | null> {
    const connection = adapter ?? this.postgresService.getWriteConnection();

    const result = await connection.query<{ id: string }>({
      sql: JOB_SQL.ENQUEUE,
      params: [name, JSON.stringify(payload), runAt ?? null, maxAttempts, dedupeKey ?? null]
    });

    return result.rows[0]?.id ?? null;
  }
}
