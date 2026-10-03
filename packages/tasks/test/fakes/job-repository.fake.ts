import { JobRepository } from '../../src/modules/repositories/job.repository';
import { JobRepositoryFakeDto } from '../interfaces/fakes.interface';

export const aJobRepository = ({ claim }: JobRepositoryFakeDto): JobRepository => ({ claim }) as unknown as JobRepository;
