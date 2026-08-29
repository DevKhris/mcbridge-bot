import { IDiscordCommand } from '../discord/command/interfaces/command.interface';
import { CommandRouterProvider } from './command-router.provider';
import { DISCORD_COMMANDS } from './command-router.tokens';

describe('CommandRouterProvider', () => {
  const command = (name: string, enabled = true): IDiscordCommand =>
    ({
      data: { name },
      enabled,
      execute: jest.fn(),
    }) as unknown as IDiscordCommand;

  it('should provide the DISCORD_COMMANDS token', () => {
    expect(CommandRouterProvider.provide).toBe(DISCORD_COMMANDS);
  });

  it('should map commands by their data name', () => {
    const commands = [command('ping'), command('echo')];
    const map = CommandRouterProvider.useFactory(...commands);

    expect(map).toBeInstanceOf(Map);
    expect(map.size).toBe(2);
    expect(map.get('ping')).toBe(commands[0]);
    expect(map.get('echo')).toBe(commands[1]);
  });

  it('should only include enabled commands', () => {
    const commands = [command('ping'), command('disabled', false)];
    const map = CommandRouterProvider.useFactory(...commands);

    expect(map.has('ping')).toBe(true);
    expect(map.has('disabled')).toBe(false);
  });

  it('should return an empty map when no commands are provided', () => {
    const map = CommandRouterProvider.useFactory();

    expect(map.size).toBe(0);
  });
});