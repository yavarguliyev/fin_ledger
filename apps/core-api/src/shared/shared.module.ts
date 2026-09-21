import { Module } from '@nestjs/common';
import { InfrastructureModule, ClientIds, SessionService } from '@common/libs';

@Module({
  imports: [InfrastructureModule.forRoot({ clientId: ClientIds.API_GATEWAY })],
  providers: [SessionService],
  exports: [InfrastructureModule, SessionService]
})
export class SharedModule {}
