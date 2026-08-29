import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Events } from 'discord.js';
import { CommandRouterService } from '../../command-router/command-router.service';
import { DISCORD_CLIENT } from './client.tokens';
import { DiscordClientService } from './client.service';

describe('DiscordClientService', () => {
  let service: DiscordClientService;
  let client: Record<string, jest.Mock>;
  let router: { dispatch: jest.Mock };
  let configService: { getOrThrow: jest.Mock };

  const readyHandler = () =>
    client.once.mock.calls.find(([event]) => event === Events.ClientReady)?.[1];
  const interactionHandler = () =>
    client.on.mock.calls.find(
      ([event]) => event === Events.InteractionCreate,
    )?.[1];

  beforeEach(async () => {
    client = {
      once: jest.fn(),
      on: jest.fn(),
      login: jest.fn().mockResolvedValue(undefined),
      removeAllListeners: jest.fn(),
      destroy: jest.fn().mockResolvedValue(undefined),
    };
    router = { dispatch: jest.fn().mockResolvedValue(undefined) };
    configService = { getOrThrow: jest.fn().mockReturnValue('test-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordClientService,
        { provide: DISCORD_CLIENT, useValue: client },
        { provide: CommandRouterService, useValue: router },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(DiscordClientService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onApplicationBootstrap', () => {
    it('should register ready and interaction listeners', async () => {
      await service.onApplicationBootstrap();

      expect(client.once).toHaveBeenCalledWith(
        Events.ClientReady,
        expect.any(Function),
      );
      expect(client.on).toHaveBeenCalledWith(
        Events.InteractionCreate,
        expect.any(Function),
      );
    });

    it('should log the bot tag once the client is ready', async () => {
      const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      await service.onApplicationBootstrap();

      readyHandler()({ user: { tag: 'Bot#1234' } });

      expect(log).toHaveBeenCalledWith('Discord client ready as Bot#1234');
    });

    it('should forward interactions to the command router', async () => {
      await service.onApplicationBootstrap();
      const interaction = { id: 'interaction-id' };

      await interactionHandler()(interaction);

      expect(router.dispatch).toHaveBeenCalledWith(interaction);
    });

    it('should login using the configured token', async () => {
      await service.onApplicationBootstrap();

      expect(configService.getOrThrow).toHaveBeenCalledWith('DISCORD_TOKEN');
      expect(client.login).toHaveBeenCalledWith('test-token');
    });
  });

  describe('onApplicationShutdown', () => {
    it('should remove listeners, destroy the client and log it', async () => {
      const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await service.onApplicationShutdown('SIGTERM');

      expect(client.removeAllListeners).toHaveBeenCalled();
      expect(client.destroy).toHaveBeenCalled();
      expect(log).toHaveBeenCalledWith(
        'Discord client destroyed due to application shutdown (signal: SIGTERM).',
      );
    });

    it('should log without a signal when none is provided', async () => {
      const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await service.onApplicationShutdown();

      expect(log).toHaveBeenCalledWith(
        'Discord client destroyed due to application shutdown.',
      );
    });
  });
});