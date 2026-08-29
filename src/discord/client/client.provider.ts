import { Client, GatewayIntentBits } from 'discord.js';
import { DISCORD_CLIENT } from './client.tokens';

export const DiscordClientProvider = {
  provide: DISCORD_CLIENT,
  useFactory: (): Client =>
    new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildExpressions,
      ],
    }),
};
