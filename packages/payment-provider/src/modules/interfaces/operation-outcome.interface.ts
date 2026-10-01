import { OperationResultDto } from '../dtos/adapter/operation-result.dto';

export interface OperationOutcome {
  result: OperationResultDto;
  amount: number;
  currency: string;
}
