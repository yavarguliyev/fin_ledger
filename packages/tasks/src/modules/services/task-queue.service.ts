import { BadRequestException, Injectable } from '@nestjs/common';

import { JobRepository } from '../repositories/job.repository';
import { EnqueueTaskDto } from '../dtos/queue/enqueue-task.dto';
import { JobIdDto } from '../dtos/queue/job-id.dto';
import { JOB } from '../constants/jobs/job.constant';

@Injectable()
export class TaskQueueService {
  constructor (private readonly jobRepository: JobRepository) {}

  async enqueue (dto: EnqueueTaskDto): Promise<string | null> {
    return this.jobRepository.enqueue(dto);
  }

  async replay ({ jobId }: JobIdDto): Promise<void> {
    const replayed = await this.jobRepository.replay({ jobId });
    if (!replayed) throw new BadRequestException(JOB.NOT_DEAD_MESSAGE);
  }
}
