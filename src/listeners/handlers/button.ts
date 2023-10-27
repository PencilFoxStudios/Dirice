import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { ActionRowBuilder, ButtonInteraction, ButtonStyle, Client, CommandInteraction, EmbedBuilder, Guild, GuildMember, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import PNFXMenu from "../../helpers/Menu";
import PNFXMember from "../../helpers/Member";
import * as PNFXEmbeds from "../../helpers/Embeds"
import * as PNFXHelpers from "../../helpers/functions"
export default async function handleButton(client: Client, EraserTail: EraserTailClient, interaction: ButtonInteraction, pnfxMember: PNFXMember): Promise<void> {
    const behavior = interaction.customId // Contains a custom ID that refers to the command ran.
    const originalMessage = interaction.message
    const GUILD = interaction.guild as Guild
    switch (behavior) {
        case "dismiss_message":
            await interaction.update({ content: "_ _", embeds: [], components: [] })
            break;
    }
    return;
}