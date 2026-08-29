import { Module } from '@nestjs/common';
import { CommandRouterModule } from '../../command-router/command-router.module';
import { DiscordClientService } from './client.service';
import { DiscordClientProvider } from './client.provider';

@Module({
  imports: [CommandRouterModule],
  providers: [DiscordClientService, DiscordClientProvider],
  exports: [DiscordClientProvider],
})
export class ClientModule {}
