import { Client, GatewayIntentBits } from 'discord.js';
import { DiscordClientProvider } from './client.provider';
import { DISCORD_CLIENT } from './client.tokens';

describe('DiscordClientProvider', () => {
  it('should provide the DISCORD_CLIENT token', () => {
    expect(DiscordClientProvider.provide).toBe(DISCORD_CLIENT);
  });

  it('should create a discord.js Client instance', () => {
    expect(DiscordClientProvider.useFactory()).toBeInstanceOf(Client);
  });

  it('should create a new client on each invocation', () => {
    expect(DiscordClientProvider.useFactory()).not.toBe(
      DiscordClientProvider.useFactory(),
    );
  });

  it('should configure the required gateway intents', () => {
    const intents = DiscordClientProvider.useFactory().options
      .intents as number;

    expect(intents & GatewayIntentBits.Guilds).toBe(GatewayIntentBits.Guilds);
    expect(intents & GatewayIntentBits.GuildMembers).toBe(
      GatewayIntentBits.GuildMembers,
    );
    expect(intents & GatewayIntentBits.GuildMessages).toBe(
      GatewayIntentBits.GuildMessages,
    );
    expect(intents & GatewayIntentBits.MessageContent).toBe(
      GatewayIntentBits.MessageContent,
    );
    expect(intents & GatewayIntentBits.GuildExpressions).toBe(
      GatewayIntentBits.GuildExpressions,
    );
  });
});