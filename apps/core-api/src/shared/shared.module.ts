import { Module } from '@nestjs/common';
import { InfrastructureModule, ClientIds, RefreshService, SessionService, StreamTicketService } from '@common/libs';

@Module({
  imports: [InfrastructureModule.forRoot({ clientId: ClientIds.API_GATEWAY })],
  providers: [SessionService, RefreshService, StreamTicketService],
  exports: [InfrastructureModule, SessionService, RefreshService, StreamTicketService]
})
export class SharedModule {}
