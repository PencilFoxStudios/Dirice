import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { ActionRowBuilder, ButtonInteraction, ButtonStyle, Client, EmbedBuilder, Guild, GuildMember, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import PNFXMenu from "../../helpers/Menu";
import PNFXMember from "../../helpers/Member";
import * as PNFXEmbeds from "../../helpers/Embeds"
export default async function handleModal(client: Client, EraserTail: EraserTailClient, interaction: ModalSubmitInteraction, pnfxMember: PNFXMember): Promise<void> {
    const behavior = interaction.customId // Contains a custom ID that refers to the command ran.
    const GUILD = interaction.guild as Guild
    switch (behavior) {
        case "mod_change_reason_modal":
            // Change the reason for an action before taking it.
            if (!interaction.isFromMessage()) {
                await interaction.reply({
                    embeds: [PNFXEmbeds.error("NOT_CONFIGURED")]
                });
                return
            };
            let originalMessage = interaction.message
            const newMenu = new PNFXMenu("#c5f9ff", false, originalMessage);
            const reasonSelected = interaction.fields.getTextInputValue('reason');
            newMenu.editEmbed(3, (embed: EmbedBuilder) => {
                embed.setDescription(`**Reason:** ${reasonSelected}`)
                return embed
            })
            await interaction.update(newMenu.toMessageObject());
            break;
        default:
            await interaction.reply({
                embeds: [PNFXEmbeds.error("NOT_CONFIGURED")]
            });
            EraserTail.log("Warn", "This bot isn't configured to handle that modal!")
            break;
    }
}