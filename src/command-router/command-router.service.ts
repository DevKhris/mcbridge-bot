import { IDiscordCommand } from './../discord/command/interfaces/command.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
type Command = IDiscordCommand;

@Injectable()
export class CommandRouterService {
  private readonly logger = new Logger(CommandRouterService.name);

  constructor(
    @Inject('DISCORD_COMMANDS')
    private readonly commands: ReadonlyMap<string, Command>,
  ) {}

  async validate(interaction: any): Promise<boolean> {
    if (!interaction.isCommand()) {
      this.logger.warn(`Received non-command interaction: ${interaction.type}`);
      return false;
    }

    return true;
  }

  async dispatch(interaction: any): Promise<void> {
    if (!await this.validate(interaction)) {
      return;
    }

    const command: Command | undefined = await this.getCommand(interaction.commandName);
    
    if (typeof command === 'undefined') {
      return;
    }

    await this.executeCommand(command, interaction);
  }

  async executeCommand(command: Command, interaction: any): Promise<void> {
    try {
      await command.execute(interaction);
    } catch (error) {
      this.logger.error(error);
      this.handleError(error, interaction);
    }
  }

  async handleError(error: any, interaction: any): Promise<void> {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
            ephemeral: true,
        });
      };
  }

  async getCommand(commandName: string): Promise<Command | undefined> {
    const command = this.commands.get(commandName);

    if (!command || !command.enabled) {
      this.logger.warn(`No command found for interaction: ${commandName}`);
      return undefined;
    }

    return command;
  }
}
