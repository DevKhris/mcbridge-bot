import { IDiscordCommand } from './../discord/command/interfaces/command.interface';
import { DISCORD_COMMANDS } from "./command-router.tokens";
type Command = IDiscordCommand;

export const CommandRouterProvider = {
    provide: DISCORD_COMMANDS,
    inject: [],
    useFactory: (...commands: Command[]) =>  {
        const enabledCommands = commands.filter((command) => command.enabled);

        return new Map(enabledCommands.map(
            (command) => [
                command.data.name,
                command,
            ])
        );
    },
}