import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { CommandInteraction, Client, SlashCommandBuilder, MessagePayload, MessagePayloadOption, ButtonStyle, SlashCommandUserOption, GuildMember, User, Guild, SlashCommandSubcommandBuilder, SlashCommandStringOption, ChatInputCommandInteraction, UserContextMenuCommandInteraction, MessageContextMenuCommandInteraction } from "discord.js";
import { PNFXCommandSupportString } from "src/helpers/types";
import { PNFXCommand } from "../Command";
import * as PNFXHelpers from "../helpers/functions"
import * as PNFXEmbeds from "../helpers/Embeds"
import * as PNFXTypes from "../helpers/types";
import PNFXMenu from "../helpers/Menu";
export class Mod extends PNFXCommand {
    constructor() {
        super(
            // Command Name
            "mod",
            // Command Description
            "Moderate a user.",
            // Supported Methods of Running
            ["SLASH", "USER_CONTEXT", "MESSAGE_CONTEXT"],
            // Should I make the user the only one able to see the reply?
            true
        );
        (this.SlashCommand as SlashCommandBuilder)
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand
                    .setName('modbyuser')
                    .setDescription("Moderate this user by @ing them (for when they're in the server)")
                    .addUserOption((option: SlashCommandUserOption) =>
                        option
                            .setName("user")
                            .setDescription("The user you would like to open the mod menu for.")
                            .setRequired(true)
                    )
            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand
                    .setName('modbyid')
                    .setDescription("Moderate this user by providing their ID (for when they're not in the server)")
                    .addStringOption((option: SlashCommandStringOption) =>
                        option
                            .setName("user")
                            .setDescription("The ID of the user you would like to open the mod menu for.")
                            .setRequired(true)
                            .setMinLength(18)
                            .setMaxLength(18)
                    )
            )
    }
    async GenMenu(type: PNFXTypes.PNFXCommandSupportString, interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction, userID: string, member: GuildMember | null, EraserTail: EraserTailClient) {
        let i = interaction;
        switch (type) {
            case "SLASH":
                i = i as ChatInputCommandInteraction;

                break;
            case "MESSAGE_CONTEXT":
                i = i as MessageContextMenuCommandInteraction;

                break;
            case "USER_CONTEXT":
                i = i as UserContextMenuCommandInteraction;

                break;
        }
        var menu = new PNFXMenu("#ffffff")
        await interaction.editReply(
            menu.toMessageObject() as MessagePayloadOption
        )
    }
    __RunSlashCommand: Function = async (client: Client, interaction: ChatInputCommandInteraction, EraserTail: EraserTailClient) => {
        const userIsInGuild = (interaction.options.getSubcommand() === 'modbyuser')
        var member: GuildMember | null = userIsInGuild ? (await (interaction.options.getMember("user") as GuildMember)?.fetch(true)) : null
        const userID = (interaction.options.getSubcommand() === 'modbyid') ? interaction.options.getString("user") as string : (member as GuildMember).user.id
        if (!member && !userID) {
            await interaction.editReply({
                embeds: [PNFXEmbeds.error("USER_NOT_FOUND")]
            });
            return
        }
        await this.GenMenu("SLASH", interaction, userID, member, EraserTail)
    }
    __RunUserContextCommand: Function = async (client: Client, interaction: UserContextMenuCommandInteraction, EraserTail: EraserTailClient) => {
        await this.GenMenu("USER_CONTEXT", interaction, interaction.targetUser.id, interaction.targetMember as GuildMember | null, EraserTail)
    }
    __RunMessageContextCommand: Function = async (client: Client, interaction: MessageContextMenuCommandInteraction, EraserTail: EraserTailClient) => {
        await this.GenMenu("MESSAGE_CONTEXT", interaction, interaction.targetMessage.author.id, interaction.targetMessage.member, EraserTail)
    }
};
