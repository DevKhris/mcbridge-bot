import { Inject, Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Events } from 'discord.js';
import { DISCORD_CLIENT } from './client.tokens';
import { CommandRouterService } from '../../command-router/command-router.service';

@Injectable()
export class DiscordClientService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(DiscordClientService.name);

  constructor(
    @Inject(DISCORD_CLIENT)
    private readonly client: Client,
    private readonly router: CommandRouterService,
    private readonly configService: ConfigService,
  ) {}
    onApplicationShutdown(signal?: string) {
        this.client.removeAllListeners();
        this.client.destroy();

        this.logger.log(
            `Discord client destroyed due to application shutdown${
                signal ? ` (signal: ${signal})` : ''
            }.`,
        );
    }

  async onApplicationBootstrap(): Promise<void> {
    this.client.once(Events.ClientReady, (client) => {
      this.logger.log(`Discord client ready as ${client.user?.tag}`);
    });

    this.client.on(Events.InteractionCreate, async (interaction) => {
      void this.router.dispatch(interaction);
    });

    const token = this.configService.getOrThrow<string>('DISCORD_TOKEN');

    await this.client.login(token);
  }
}