import { ProviderMethodResultDto } from '../dtos/operation/provider-method-result.dto';
import { CreateSetupSessionDto } from '../dtos/operation/create-setup-session.dto';
import { SetupSessionResultDto } from '../dtos/operation/setup-session-result.dto';
import { RetrieveSessionDto } from '../dtos/contract/retrieve-session.dto';

export interface SupportsHostedSetup {
  createSetupSession(dto: CreateSetupSessionDto): Promise<SetupSessionResultDto>;
  retrieveSessionPaymentMethod(dto: RetrieveSessionDto): Promise<ProviderMethodResultDto>;
}
