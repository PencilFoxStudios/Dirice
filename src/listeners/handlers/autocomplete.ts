import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { ActionRowBuilder, ApplicationCommandOptionChoiceData, AutocompleteInteraction, ButtonInteraction, ButtonStyle, Client, EmbedBuilder, Guild, GuildMember, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import PNFXMenu from "../../helpers/Menu";
import PNFXMember from "../../helpers/Member";
import * as PNFXEmbeds from "../../helpers/Embeds"
import { DiriceDBClient } from "../../api/DiriceDBClient";
import { Character } from "../../objects/Character";
import { modifierToString } from "../../helpers/functions";
import { Campaign } from "../../objects/Campaign";
export default async function handleAutocomplete(client: Client, EraserTail: EraserTailClient, interaction: AutocompleteInteraction, pnfxMember: PNFXMember): Promise<void> {
    const DiriceClient = new DiriceDBClient(interaction.user.id);
    const Player = (await DiriceClient.me());
    const focusedValue = interaction.options.getFocused(true);
    const PlayerSettings = Player.getSettings();
    switch(focusedValue.name){
        case "roll-character":
            const rollableOptions:ApplicationCommandOptionChoiceData[] = [];
            let rollable = (await Player.getRollableCharacters())
            if(focusedValue.value !== ""){
                rollable = rollable.filter((char:Character) => char.getName().toLowerCase().startsWith(focusedValue.value.toLowerCase()))
            }
            for (const rollableCharacter of rollable){
                rollableOptions.push({
                    name: rollableCharacter.getName(),
                    value: rollableCharacter.getID()
                })
            }
            await interaction.respond(rollableOptions)
            break;
        case "manage-character":
            const manageableOptions:ApplicationCommandOptionChoiceData[] = [];
            let manageable = await Player.getManageableCharacters();
            if(focusedValue.value !== ""){
                manageable = manageable.filter((char:Character) => char.getName().toLowerCase().startsWith(focusedValue.value.toLowerCase()))
            }
            for (const rollableCharacter of manageable){
                manageableOptions.push({
                    name: rollableCharacter.getName(),
                    value: rollableCharacter.getID()
                })
            }
            await interaction.respond(manageableOptions)
            break;
        case "stat":

            const stats:ApplicationCommandOptionChoiceData[] = [];
            const CurrentCharacter = (await Player.getRollableCharacters()).find((char: Character) => char.getID() == PlayerSettings.selected_character)
            if((PlayerSettings.selected_character == null) || (CurrentCharacter == null)){
                await interaction.respond([])
                break;
            }
            await CurrentCharacter.fetchStats();
            for (const stat of CurrentCharacter.getStats()){
                stats.push({
                    name: `${stat.roll_name} (${modifierToString(stat.roll_modifier)})`,
                    value: stat.roll_name
                })
            }
            
            await interaction.respond(stats)
            break;
        case "link-campaign":
            const campaigns:ApplicationCommandOptionChoiceData[] = [];
            const Campaigns:Campaign[] = await DiriceClient.campaigns().get(focusedValue.value);
            for (const campaign of Campaigns){
                campaigns.push({
                    name: campaign.getName(),
                    value: campaign.getID()
                })
            }
            await interaction.respond(campaigns)
            break;
        default:
            EraserTail.log("Warn", "This bot isn't configured to handle the autocomplete " + focusedValue + "!")
            break;
    }

}