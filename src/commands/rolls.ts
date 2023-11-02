import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { CommandInteraction, Client, SlashCommandBuilder, MessagePayload, MessagePayloadOption, ButtonStyle, SlashCommandUserOption, GuildMember, User, Guild, SlashCommandSubcommandBuilder, SlashCommandStringOption, ChatInputCommandInteraction, UserContextMenuCommandInteraction, MessageContextMenuCommandInteraction, SlashCommandIntegerOption, SlashCommandBooleanOption, SlashCommandAttachmentOption } from "discord.js";
import { PNFXCommandSupportString } from "../helpers/types";
import { PNFXCommand } from "../Command";
import * as PNFXHelpers from "../helpers/functions"
import * as PNFXEmbeds from "../helpers/Embeds"
import * as PNFXTypes from "../helpers/types";
import PNFXMenu from "../helpers/Menu";
import { DiriceDBClient } from "../api/DiriceDBClient";
import { Character } from "../objects/Character";
import { CampaignNotOpenError, CharacterAlreadyExistsError, PlayerNoPermissionsError, RollAlreadyExistsError, StorageBucketRejectError } from "../errors/Errors";
import { Roll } from "../objects/Roll";
import { Campaign } from "../objects/Campaign";

export class Rolls extends PNFXCommand {
    constructor() {
        super(
            // Command Name
            "rolls",
            // Command Description
            "Manage rolls!",
            // Supported Methods of Running
            ["SLASH"],
            // Should I make the user the only one able to see the reply?
            true
        );
        (this.SlashCommand as SlashCommandBuilder)

            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand
                    .setName('create')
                    .setDescription("Create a roll and link it to a character or campaign. These can all be changed later!")
                    .addStringOption((option: SlashCommandStringOption) =>
                    option
                        .setName("name")
                        .setDescription("The roll's full name.")
                        .setRequired(true)
                        .setMinLength(3)
                        .setMaxLength(20)
                    )
                    .addIntegerOption((option: SlashCommandIntegerOption) =>
                    option
                        .setName("manage-campaign")
                        .setDescription("Link this roll to an existing campaign.")
                        .setRequired(false)
                        .setAutocomplete(true)
                    )
                    .addIntegerOption((option: SlashCommandIntegerOption) =>
                    option
                        .setName("manage-character")
                        .setDescription("Link this roll to an existing character.")
                        .setRequired(false)
                        .setAutocomplete(true)
                    )
                    .addIntegerOption((option: SlashCommandIntegerOption) =>
                    option
                        .setName("number-of-dice")
                        .setDescription("The number of dice that you would like this roll to roll. (Default: 1)")
                        .setMinValue(1)
                        .setMaxValue(5000)
                        .setRequired(false))
                    .addIntegerOption((option: SlashCommandIntegerOption) =>
                    option
                        .setName("sides-of-dice")
                        .setDescription("The number of sides you want the dice to have. (Default: 20)")
                        .setMinValue(1)
                        .setMaxValue(10000)
                        .setRequired(false))



            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand
                .setName('edit')
                .setDescription("Edit a roll's information.")
                .addIntegerOption((option: SlashCommandIntegerOption) =>
                    option
                        .setName("manage-roll")
                        .setDescription("The roll you would like to edit.")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption((option: SlashCommandStringOption) =>
                option
                    .setName("name")
                    .setDescription("The roll's full name.")
                    .setRequired(false)
                    .setMinLength(3)
                    .setMaxLength(20)
                )
                .addIntegerOption((option: SlashCommandIntegerOption) =>
                option
                    .setName("number-of-dice")
                    .setDescription("The number of dice that you would like this roll to roll. (Default: 1)")
                    .setMinValue(1)
                    .setMaxValue(5000)
                    .setRequired(false))
                .addIntegerOption((option: SlashCommandIntegerOption) =>
                option
                    .setName("sides-of-dice")
                    .setDescription("The number of sides you want the dice to have. (Default: 20)")
                    .setMinValue(1)
                    .setMaxValue(10000)
                    .setRequired(false))
            )
                
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand
                    .setName('info')
                    .setDescription("View the information of this roll.")
                    .addIntegerOption((option: SlashCommandIntegerOption) =>
                        option
                            .setName("manage-roll")
                            .setDescription("The roll you would like to view.")
                            .setRequired(true)
                            .setAutocomplete(true)
                    )

            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand
                .setName('link-to-campaign')
                .setDescription("Link a roll to a campaign. (If this roll is currently linked to a character, it will be unlinked.)")
                .addIntegerOption((option: SlashCommandIntegerOption) =>
                    option
                        .setName("manage-roll")
                        .setDescription("The roll you would like to link.")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addIntegerOption((option: SlashCommandIntegerOption) =>
                option
                    .setName("link-campaign")
                    .setDescription("The campaign you would like to link the roll to.")
                    .setRequired(true)
                    .setAutocomplete(true)
            )
        )
        .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
        subcommand
            .setName('link-to-character')
            .setDescription("Link a roll to a character. (If this roll is currently linked to a campaign, it will be unlinked.)")
            .addIntegerOption((option: SlashCommandIntegerOption) =>
                option
                    .setName("manage-roll")
                    .setDescription("The roll you would like to link.")
                    .setRequired(true)
                    .setAutocomplete(true)
            )
            .addIntegerOption((option: SlashCommandIntegerOption) =>
            option
                .setName("manage-character")
                .setDescription("The character you would like to link the roll to.")
                .setRequired(true)
                .setAutocomplete(true)
        )
    )

    }

    __RunSlashCommand: Function = async (client: Client, interaction: ChatInputCommandInteraction, EraserTail: EraserTailClient) => {
        const DiriceClient = new DiriceDBClient(interaction.user.id)
        const Player = (await DiriceClient.me());
      
        const chosen = {
            name: interaction.options.getString("name") ?? undefined,
            manageCampaign: interaction.options.getInteger("manage-campaign") ?? undefined,
            manageCharacter: interaction.options.getInteger("manage-character") ?? undefined,
            manageRoll: interaction.options.getInteger("manage-roll") ?? undefined,
            numberOfDice: interaction.options.getInteger("number-of-dice") ?? undefined,
            sidesOfDice: interaction.options.getInteger("sides-of-dice") ?? undefined,
            linkCampaign: interaction.options.getInteger("link-campaign") ?? undefined,
        }
        
        const PlayerSettings = Player.getSettings()

        switch (interaction.options.getSubcommand(true)) {
            case "create":
                if(chosen.manageCampaign && chosen.manageCharacter){
                    await interaction.editReply({
                        embeds: [PNFXEmbeds.error("GENERAL_COMMAND_ERROR", "You can only link a roll to a campaign or a character, not both!")]
                    })
                    return;
                }
                if(chosen.manageCampaign){
                    const campaign = (await Player.getManageableCampaigns()).find((camp: Campaign) => camp.getID() == chosen.manageCampaign)
                    if(campaign){
                        try{
                            await campaign.createRoll(chosen.name!, chosen.numberOfDice, chosen.sidesOfDice)
                            await interaction.editReply({
                                embeds: [PNFXEmbeds.success(`Successfully created roll ${chosen.name}!`)]
                            })
                        }catch(err){
                            if(err instanceof StorageBucketRejectError){
                                await interaction.editReply({
                                    embeds: [PNFXEmbeds.error("UNK", "There was an error creating this roll. Please try again later.")]
                                })
                                return;
                            }else if(err instanceof RollAlreadyExistsError){
                                await interaction.editReply({
                                    embeds: [PNFXEmbeds.error("ROLL_ALREADY_EXISTS", "This roll already exists!")]
                                })
                                return;
                            }
                            throw err;
                        }
                    }
                }
                if(chosen.manageCharacter){
                    const character = (await Player.getManageableCharacters()).find((char: Character) => char.getID() == chosen.manageCharacter)
                    if(character){
                        try{
                            await character.createRoll(chosen.name!, chosen.numberOfDice, chosen.sidesOfDice)
                            await interaction.editReply({
                                embeds: [PNFXEmbeds.success(`Successfully created roll ${chosen.name}!`)]
                            })
                        }catch(err){
                            if(err instanceof StorageBucketRejectError){
                                await interaction.editReply({
                                    embeds: [PNFXEmbeds.error("UNK", "There was an error creating this roll. Please try again later.")]
                                })
                                return;
                            }else if(err instanceof RollAlreadyExistsError){
                                await interaction.editReply({
                                    embeds: [PNFXEmbeds.error("ROLL_ALREADY_EXISTS", "This roll already exists!")]
                                })
                                return;
                            }
                            throw err;
                        }
                    }
                }
                break;
            case "edit":
                if(chosen.manageRoll){
                    const roll = (await Player.getManageableRolls()).find((roll: Roll) => roll.getID() == chosen.manageRoll)
                    if(roll){
                        try{
                            await DiriceClient.roll({
                                id: roll.getID(),
                                roll_name: chosen.name,
                                dice_amt: chosen.numberOfDice,
                                dice_max: chosen.sidesOfDice
                            }).update()
                            await interaction.editReply({
                                embeds: [PNFXEmbeds.success(`Successfully edited roll ${chosen.name}!`)]
                            })
                        }catch(err){
                            if(err instanceof StorageBucketRejectError){
                                await interaction.editReply({
                                    embeds: [PNFXEmbeds.error("UNK", "There was an error editing this roll. Please try again later.")]
                                })
                                return;
                            }else if(err instanceof PlayerNoPermissionsError){
                                await interaction.editReply({
                                    embeds: [PNFXEmbeds.error("GENERAL_COMMAND_ERROR", err.message)]
                                })
                                return;
                            }
                            throw err;
                        }
                    }
                }else{
                    await interaction.editReply({
                        embeds: [PNFXEmbeds.error("GENERAL_COMMAND_ERROR", "You must specify a roll to edit!")]
                    })
                    return;
                }
                break;
            case "info":
                if(chosen.manageRoll){
                    const roll = (await Player.getManageableRolls()).find((roll: Roll) => roll.getID() == chosen.manageRoll)
                    if(roll){
                        try{
                            await interaction.editReply({
                                embeds: [PNFXEmbeds.rollInfoEmbed(roll)]
                            })
                        }catch(err){
                            if(err instanceof StorageBucketRejectError){
                                await interaction.editReply({
                                    embeds: [PNFXEmbeds.error("UNK", "There was an error fetching this roll. Please try again later.")]
                                })
                                return;
                            }else if(err instanceof PlayerNoPermissionsError){
                                await interaction.editReply({
                                    embeds: [PNFXEmbeds.error("GENERAL_COMMAND_ERROR", err.message)]
                                })
                                return;
                            }
                            throw err;
                        }
                    }
                }else{
                    await interaction.editReply({
                        embeds: [PNFXEmbeds.error("GENERAL_COMMAND_ERROR", "You must specify a roll to view!")]
                    })
                    return;
                }
                break;
            case "link-to-campaign":
                if(chosen.manageRoll){
                    const roll = (await Player.getManageableRolls()).find((roll: Roll) => roll.getID() == chosen.manageRoll)
                    if(roll){
                        const campaign = (await Player.getManageableCampaigns()).find((camp: Campaign) => camp.getID() == chosen.linkCampaign)
                        if(campaign){
                            try{
                                await roll.linkToCampaign(campaign)
                                await interaction.editReply({
                                    embeds: [PNFXEmbeds.success(`Successfully linked roll ${roll.getName()} to campaign ${campaign.getName()}!`)]
                                })
                            }catch(err){
                                if(err instanceof StorageBucketRejectError){
                                    await interaction.editReply({
                                        embeds: [PNFXEmbeds.error("UNK", "There was an error linking this roll. Please try again later.")]
                                    })
                                    return;
                                }else if(err instanceof PlayerNoPermissionsError){
                                    await interaction.editReply({
                                        embeds: [PNFXEmbeds.error("GENERAL_COMMAND_ERROR", err.message)]
                                    })
                                    return;
                                }
                                throw err;
                            }
                        }
                    }
                }else{
                    await interaction.editReply({
                        embeds: [PNFXEmbeds.error("GENERAL_COMMAND_ERROR", "You must specify a roll to link!")]
                    })
                    return;
                }
                break;
            case "link-to-character":
                if(chosen.manageRoll){
                    const roll = (await Player.getManageableRolls()).find((roll: Roll) => roll.getID() == chosen.manageRoll)
                    if(roll){
                        const character = (await Player.getManageableCharacters()).find((char: Character) => char.getID() == chosen.manageCharacter)
                        if(character){
                            try{
                                await roll.linkToCharacter(character)
                                await interaction.editReply({
                                    embeds: [PNFXEmbeds.success(`Successfully linked roll ${roll.getName()} to character ${character.getName()}!`)]
                                })
                            }catch(err){
                                if(err instanceof StorageBucketRejectError){
                                    await interaction.editReply({
                                        embeds: [PNFXEmbeds.error("UNK", "There was an error linking this roll. Please try again later.")]
                                    })
                                    return;
                                }else if(err instanceof PlayerNoPermissionsError){
                                    await interaction.editReply({
                                        embeds: [PNFXEmbeds.error("GENERAL_COMMAND_ERROR", err.message)]
                                    })
                                    return;
                                }
                                throw err;
                            }
                        }
                    }
                }else{
                    await interaction.editReply({
                        embeds: [PNFXEmbeds.error("GENERAL_COMMAND_ERROR", "You must specify a roll to link!")]
                    })
                    return;
                }
                break;
            }

                            


    }

};
