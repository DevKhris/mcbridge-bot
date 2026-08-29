import { SlashCommandBuilder } from "discord.js";

export interface IDiscordCommand {
    readonly data: SlashCommandBuilder;
    readonly enabled: boolean;

    execute(interaction: any): Promise<void>;
}