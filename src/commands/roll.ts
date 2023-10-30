import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { CommandInteraction, Client, SlashCommandBuilder, SlashCommandNumberOption, SlashCommandStringOption, ChatInputCommandInteraction, SlashCommandIntegerOption } from "discord.js";
import { PNFXCommandSupportString } from "../helpers/types";
import { PNFXCommand } from "../Command";
import * as PNFXEmbeds from "../helpers/Embeds"
import PNFXMenu from "../helpers/Menu"
import { DiriceDBClient } from "../api/DiriceDBClient";
import { Character } from "../objects/Character";
import { OfflineRoll } from "../objects/OfflineRoll";
import { CharacterNoStatError } from "../errors/CharacterNoStatError";
export class Roll extends PNFXCommand {
    constructor() {
        super(
            // Command Name
            "roll",
            // Command Description
            "Roll a dice based on your current character. Optional parameters will override any character stats.",
            // Supported Methods of Running
            ["SLASH"],
            // Should I make the user the only one able to see the reply?
            false
        );
        (this.SlashCommand as SlashCommandBuilder)
            .addStringOption((option: SlashCommandStringOption) =>
                option
                    .setName("stat")
                    .setDescription("The stat to roll, based off the current character.")
                    .setRequired(false)
                    .setAutocomplete(true))
            .addIntegerOption((option: SlashCommandIntegerOption) =>
                option
                    .setName("number-of-dice")
                    .setDescription("The number of dice that you would like to roll.")
                    .setMinValue(1)
                    .setMaxValue(150)
                    .setRequired(false))
            .addIntegerOption((option: SlashCommandIntegerOption) =>
                option
                    .setName("sides-of-dice")
                    .setDescription("The number of sides you want the dice to have.")
                    .setMinValue(1)
                    .setMaxValue(1000)
                    .setRequired(false))
            .addIntegerOption((option: SlashCommandIntegerOption) =>
                option
                    .setName("bonus")
                    .setDescription("Adds a bonus to the roll(s).")
                    .setMinValue(1)
                    .setMaxValue(9999)
                    .setRequired(false))


    }
    __RunSlashCommand: Function = async (client: Client, interaction: ChatInputCommandInteraction, EraserTail: EraserTailClient) => {
        const DiriceClient = new DiriceDBClient(interaction.user.id)
        const Player = (await DiriceClient.me());
        const chosen = {
            stat: interaction.options.getString("stat") ?? undefined,
            numberOfDice: interaction.options.getInteger("number-of-dice")??undefined,
            sidesOfDice: interaction.options.getInteger("sides-of-dice")??undefined,
            bonus: interaction.options.getInteger("bonus")??undefined
        }
        const PlayerSettings = Player.getSettings()
        if (PlayerSettings.selected_character == null) {
            const Roll = new OfflineRoll(chosen.numberOfDice, 1, chosen.sidesOfDice, chosen.bonus)
            const Rolls = Roll.makeRolls();

            await interaction.editReply({
                embeds: [PNFXEmbeds.user(interaction.user, `${interaction.user.username} rolls for ${chosen.stat}!`), PNFXEmbeds.rollingResult(Rolls).setFooter({ text: "If you meant to use a character's stats, please run /characters switch." })]
            });
            return
        } else {
            const CurrentCharacter = (await Player.getRollableCharacters()).find((char: Character) => char.getID() == PlayerSettings.selected_character)
            if (CurrentCharacter) {
                try {
                    let Rolls;
                    await CurrentCharacter.fetchStats();
                    await CurrentCharacter.fetchCampaign()
                    await CurrentCharacter.getCampaign().syncStatsWithCharacters()
                

                    if(chosen.stat){
                        Rolls = CurrentCharacter.rollForStat(chosen.stat, chosen.numberOfDice, chosen.sidesOfDice, chosen.bonus);
                    }else{
                        Rolls = CurrentCharacter.roll(chosen.numberOfDice, chosen.sidesOfDice, chosen.bonus)
                    }
                    
                    await interaction.editReply({
                        embeds: [PNFXEmbeds.user(interaction.user).setAuthor({ iconURL: CurrentCharacter.getPhotoURL(), name: `${CurrentCharacter.getName()} rolls ${chosen.stat??`${((chosen.numberOfDice??1) == 1)?"a":chosen.numberOfDice} ${chosen.sidesOfDice??20}-sided di${chosen.numberOfDice??1>1?"ce":"e"}`}!` }), PNFXEmbeds.rollingResult(Rolls)]
                    });
                    return
                } catch (e) {
                    if (e instanceof CharacterNoStatError) {
                        await interaction.editReply({
                            embeds: [PNFXEmbeds.error("STAT_NOT_FOUND", e.message + `\nIf you want to roll generically, please run \`\`/characters switch.\`\``)]
                        });
                        return
                    }
                    throw e;
                }

            } else {
                await interaction.editReply({
                    embeds: [PNFXEmbeds.error("CHARACTER_NOT_FOUND", "This could happen if the character you had selected no longer exists, or you lost access to roll for it. Please select a new one via the ``/characters switch`` command.")]
                });
                return
            }
        }

    };

};
