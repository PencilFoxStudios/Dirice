import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { CommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import { PNFXCommandSupportString } from "../helpers/types";
import { PNFXCommand } from "../Command";
import * as PNFXEmbeds from "../helpers/Embeds"
import PNFXMenu from "../helpers/Menu"
export class Ping extends PNFXCommand {
    constructor() {
        super(
            // Command Name
            "ping",
            // Command Description
            "Ping the bot!",
            // Supported Methods of Running
            ["SLASH"],
            // Should I make the user the only one able to see the reply?
            false
        );
    }
    __RunSlashCommand: Function = async (client: Client, interaction: CommandInteraction, EraserTail: EraserTailClient) => {
        await interaction.editReply(
            {
                embeds: [ PNFXEmbeds.success("Pong!")]
            }
        )
    };

};
