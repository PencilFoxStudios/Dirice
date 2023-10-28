import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { CommandInteraction, Client, SlashCommandBuilder, MessagePayload, MessagePayloadOption, ButtonStyle, SlashCommandUserOption, GuildMember, User, Guild, SlashCommandSubcommandBuilder, SlashCommandStringOption, ChatInputCommandInteraction, UserContextMenuCommandInteraction, MessageContextMenuCommandInteraction, SlashCommandIntegerOption } from "discord.js";
import { PNFXCommandSupportString } from "src/helpers/types";
import { PNFXCommand } from "../Command";
import * as PNFXHelpers from "../helpers/functions"
import * as PNFXEmbeds from "../helpers/Embeds"
import * as PNFXTypes from "../helpers/types";
import PNFXMenu from "../helpers/Menu";
import { DiriceDBClient } from "src/api/DiriceDBClient";
const DiriceClient = new DiriceDBClient()
export class Characters extends PNFXCommand {
    constructor() {
        super(
            // Command Name
            "characters",
            // Command Description
            "Manage characters!",
            // Supported Methods of Running
            ["SLASH"],
            // Should I make the user the only one able to see the reply?
            true
        );
        (this.SlashCommand as SlashCommandBuilder)
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand
                    .setName('switch')
                    .setDescription("Switch to this character for any rolls.")
                    .addIntegerOption((option: SlashCommandIntegerOption) =>
                        option
                            .setName("character")
                            .setDescription("The character you would like to switch to.")
                            .setRequired(true)
                            .setAutocomplete(true)
                    )
            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand
                    .setName('info')
                    .setDescription("View the information of this character.")
                    .addIntegerOption((option: SlashCommandIntegerOption) =>
                        option
                            .setName("character")
                            .setDescription("The character you would like to view.")
                            .setRequired(true)
                            .setAutocomplete(true)
                    )
            )
    }

    __RunSlashCommand: Function = async (client: Client, interaction: ChatInputCommandInteraction, EraserTail: EraserTailClient) => {
        const character = interaction.options.getInteger("character")
        if(!character){
            await interaction.editReply({
                embeds: [PNFXEmbeds.error("GENERAL_COMMAND_ERROR")]
            });
            return
        }
        let charactersInDB = await DiriceClient.characters({owner_id: interaction.user.id}).get()
        if(charactersInDB.length == 0){
            await interaction.editReply({
                embeds: [PNFXEmbeds.error("CHARACTER_NOT_FOUND")]
            });
            return
        }
        if(charactersInDB.length > 1){
            await interaction.editReply({
                embeds: [PNFXEmbeds.error("UNK", "charactersInDB.length > 1")]
            });
            EraserTail.log("Warn", "charactersInDB.length > 1 for character ID " + character)
            return
        }
        switch(interaction.options.getSubcommand()){
            case "switch":
                break;
            case "info":
                break;
        }

        
    }

};
