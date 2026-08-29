import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommandRouterModule } from '../../command-router/command-router.module';
import { DiscordClientService } from './client.service';
import { DiscordClientProvider } from './client.provider';

@Module({
  imports: [CommandRouterModule, ConfigModule.forRoot({})],
  providers: [DiscordClientService, DiscordClientProvider],
  exports: [DiscordClientProvider],
})
export class ClientModule {}
