import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { CommandInteraction, Client, SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType } from "discord.js";
import * as PNFXTypes from './helpers/types'
export class PNFXCommand {
    readonly name: string;
    readonly description: string;
    secret: boolean = true;
    supports: PNFXTypes.PNFXCommandSupportString[] = [];
    SlashCommand: SlashCommandBuilder | undefined;
    UserContextCommand: ContextMenuCommandBuilder | undefined;
    MessageContextCommand: ContextMenuCommandBuilder | undefined;
    __RunSlashCommand: Function | undefined;
    __RunUserContextCommand: Function | undefined;
    __RunMessageContextCommand: Function | undefined;
    constructor(name: string, description: string, supports: PNFXTypes.PNFXCommandSupportString[], secret = true) {
        this.name = name;
        this.description = description;
        this.supports = supports;
        this.secret = secret
        if (supports.includes('SLASH')) {
            this.SlashCommand = new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(description);
        }
        if (supports.includes('USER_CONTEXT')) {
            this.UserContextCommand = new ContextMenuCommandBuilder()
                .setName(this.name)
        }
        if (supports.includes('MESSAGE_CONTEXT')) {
            this.MessageContextCommand = new ContextMenuCommandBuilder()
                .setName(this.name)
        }
    }
    info() {
        return {
            name: this.name,
            description: this.description
        }
    }
    async run(client: Client, interaction: CommandInteraction, EraserTail: EraserTailClient) {
        await interaction.deferReply({ ephemeral: this.secret })
        switch (interaction.commandType) { // Check the command's type.
            case ApplicationCommandType.ChatInput:
                // Command is a slash command!
                if (!this.__RunSlashCommand) return EraserTail.log("Error", `${this.name} command cannot be ran in a slash command!`)
                await this.__RunSlashCommand(client, interaction, EraserTail)
                break
            case ApplicationCommandType.User:
                // Command is a user context command!
                if (!this.__RunUserContextCommand) return EraserTail.log("Error", `${this.name} command cannot be ran in a user context menu!`)
                await this.__RunUserContextCommand(client, interaction, EraserTail)
                break
            case ApplicationCommandType.Message:
                // Command is a message context command!
                if (!this.__RunMessageContextCommand) return EraserTail.log("Error", `${this.name} command cannot be ran in a message context menu!`)
                await this.__RunMessageContextCommand(client, interaction, EraserTail)
                break
        }
    }
}