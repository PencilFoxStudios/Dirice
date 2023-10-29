import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { CommandInteraction, Client, SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ModalBuilder, Interaction, ChatInputCommandInteraction, UserContextMenuCommandInteraction, MessageContextMenuCommandInteraction, Message } from "discord.js";
import { PNFXCommandSupportString } from "../helpers/types";
import { PNFXCommand } from "../Command";
import * as PNFXEmbeds from "../helpers/Embeds";
import * as PNFXTypes from "../helpers/types";
export class Openmodel extends PNFXCommand {
    constructor() {
        super(
            // Command Name
            "openmodal",
            // Command Description
            "Opens an example modal and tests reciept.",
            // Supported Methods of Running
            ["SLASH", "USER_CONTEXT", "MESSAGE_CONTEXT"],
            // Should I make the user the only one able to see the reply?
            true
        );
    }
    GenModal(type: PNFXTypes.PNFXCommandSupportString, interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction) {
        let i = interaction;
        let modal: ModalBuilder = new ModalBuilder().setCustomId("myModal");
        switch (type) {
            case "SLASH":
                i = i as ChatInputCommandInteraction;
                modal.setTitle(`Taking action!`);
                break;
            case "MESSAGE_CONTEXT":
                i = i as MessageContextMenuCommandInteraction;
                modal.setTitle(`Taking action on ${i.targetMessage.author.tag}'s message!`);
                break;
            case "USER_CONTEXT":
                i = i as UserContextMenuCommandInteraction;
                modal.setTitle(`Taking action on ${i.targetUser.tag}!`);
                break;
        }
        const input1 = new TextInputBuilder()
            .setCustomId("input1")
            .setLabel("How long should this action be? (in Days)")
            // Short means only a single line of text
            .setStyle(TextInputStyle.Short);
        const input2 = new TextInputBuilder()
            .setCustomId("input2")
            .setLabel("What reason? (This will be DMed to them)")
            // Paragraph means multiple lines of text.
            .setStyle(TextInputStyle.Paragraph);
        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(input1);
        const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(input2);
        modal.addComponents(firstActionRow, secondActionRow);
        return modal
    }
    __RunSlashCommand: Function = async (client: Client, interaction: ChatInputCommandInteraction, EraserTail: EraserTailClient) => {
        await interaction.showModal(this.GenModal("SLASH", interaction));
        await interaction.followUp({
            ephemeral: true,
            embeds: [PNFXEmbeds.info(undefined, "Modal successfully opened!")],
        });
    };
    __RunUserContextCommand: Function = async (client: Client, interaction: ChatInputCommandInteraction, EraserTail: EraserTailClient) => {
        await interaction.showModal(this.GenModal("USER_CONTEXT", interaction));
        await interaction.followUp({
            ephemeral: true,
            embeds: [PNFXEmbeds.info(undefined, "Modal successfully opened!")],
        });
    };
    __RunMessageContextCommand: Function = async (client: Client, interaction: ChatInputCommandInteraction, EraserTail: EraserTailClient) => {
        await interaction.showModal(this.GenModal("MESSAGE_CONTEXT", interaction));
        await interaction.followUp({
            ephemeral: true,
            embeds: [PNFXEmbeds.info(undefined, "Modal successfully opened!")],
        });
    };
}
