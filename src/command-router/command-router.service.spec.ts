import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IDiscordCommand } from '../discord/command/interfaces/command.interface';
import { CommandRouterService } from './command-router.service';
import { DISCORD_COMMANDS } from './command-router.tokens';

describe('CommandRouterService', () => {
  let service: CommandRouterService;
  let commands: Map<string, IDiscordCommand>;
  let execute: jest.Mock;

  const command = (name: string, enabled = true): IDiscordCommand =>
    ({
      data: { name },
      enabled,
      execute,
    }) as unknown as IDiscordCommand;

  const commandInteraction = (commandName = 'ping') => ({
    isCommand: jest.fn().mockReturnValue(true),
    commandName,
    replied: false,
    deferred: false,
    reply: jest.fn().mockResolvedValue(undefined),
    followUp: jest.fn().mockResolvedValue(undefined),
  });

  beforeEach(async () => {
    execute = jest.fn().mockResolvedValue(undefined);

    commands = new Map<string, IDiscordCommand>();
    commands.set('ping', command('ping'));
    commands.set('disabled', command('disabled', false));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommandRouterService,
        { provide: DISCORD_COMMANDS, useValue: commands },
      ],
    }).compile();

    service = module.get(CommandRouterService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validate', () => {
    it('should return true for a command interaction', async () => {
      await expect(service.validate(commandInteraction())).resolves.toBe(true);
    });

    it('should return false and warn for a non-command interaction', async () => {
      const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      const interaction = { isCommand: () => false, type: 'MESSAGE_COMPONENT' };

      await expect(service.validate(interaction)).resolves.toBe(false);
      expect(warn).toHaveBeenCalledWith(
        'Received non-command interaction: MESSAGE_COMPONENT',
      );
    });
  });

  describe('dispatch', () => {
    it('should execute the command matching the interaction', async () => {
      await service.dispatch(commandInteraction('ping'));

      expect(execute).toHaveBeenCalledTimes(1);
      expect(execute).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should ignore interactions without a registered command', async () => {
      await service.dispatch(commandInteraction('unknown'));

      expect(execute).not.toHaveBeenCalled();
    });

    it('should ignore non-command interactions', async () => {
      const interaction = { isCommand: () => false, type: 'MESSAGE_COMPONENT' };

      await service.dispatch(interaction);

      expect(execute).not.toHaveBeenCalled();
    });

    it('should not execute a disabled command', async () => {
      await service.dispatch(commandInteraction('disabled'));

      expect(execute).not.toHaveBeenCalled();
    });
  });

  describe('getCommand', () => {
    it('should return the command registered under the given name', async () => {
      await expect(service.getCommand('ping')).resolves.toBe(
        commands.get('ping'),
      );
    });

    it('should return undefined for an unknown command name', async () => {
      await expect(service.getCommand('unknown')).resolves.toBeUndefined();
    });

    it('should return undefined for a disabled command', async () => {
      await expect(service.getCommand('disabled')).resolves.toBeUndefined();
    });
  });

  describe('executeCommand', () => {
    it('should delegate to the command execution', async () => {
      const interaction = commandInteraction('ping');

      await service.executeCommand(commands.get('ping')!, interaction);

      expect(execute).toHaveBeenCalledTimes(1);
      expect(execute).toHaveBeenCalledWith(interaction);
    });

    it('should reply when the command execution fails', async () => {
      execute.mockRejectedValueOnce(new Error('boom'));
      const interaction = commandInteraction('ping');
      interaction.replied = false;
      interaction.deferred = false;
      jest.spyOn(Logger.prototype, 'error').mockImplementation();

      await service.executeCommand(commands.get('ping')!, interaction);

      expect(interaction.reply).toHaveBeenCalledWith({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    });
  });

  describe('handleError', () => {
    it('should follow up when the interaction was already replied', async () => {
      const interaction = commandInteraction('ping');
      interaction.replied = true;

      await service.handleError(new Error('boom'), interaction);

      expect(interaction.followUp).toHaveBeenCalledWith({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
      expect(interaction.reply).not.toHaveBeenCalled();
    });

    it('should follow up when the interaction was deferred', async () => {
      const interaction = commandInteraction('ping');
      interaction.deferred = true;

      await service.handleError(new Error('boom'), interaction);

      expect(interaction.followUp).toHaveBeenCalledWith({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
      expect(interaction.reply).not.toHaveBeenCalled();
    });

    it('should reply when the interaction has not been replied yet', async () => {
      const interaction = commandInteraction('ping');

      await service.handleError(new Error('boom'), interaction);

      expect(interaction.reply).toHaveBeenCalledWith({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    });
  });
});