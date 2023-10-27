import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { ActionRowBuilder, AutocompleteInteraction, ButtonInteraction, ButtonStyle, Client, EmbedBuilder, Guild, GuildMember, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import PNFXMenu from "../../helpers/Menu";
import PNFXMember from "../../helpers/Member";
import * as PNFXEmbeds from "../../helpers/Embeds"
export default async function handleAutocomplete(client: Client, EraserTail: EraserTailClient, interaction: AutocompleteInteraction, pnfxMember: PNFXMember): Promise<void> {
    const focusedValue = interaction.options.getFocused();
    EraserTail.log("Warn", "This bot isn't configured to handle autocompletes!")
}