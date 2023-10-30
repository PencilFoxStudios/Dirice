import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { CommandInteraction, Client, SlashCommandBuilder, MessagePayload, MessagePayloadOption, ButtonStyle, SlashCommandUserOption, GuildMember, User, Guild, SlashCommandSubcommandBuilder, SlashCommandStringOption, ChatInputCommandInteraction, UserContextMenuCommandInteraction, MessageContextMenuCommandInteraction, SlashCommandIntegerOption, SlashCommandBooleanOption } from "discord.js";
import { PNFXCommandSupportString } from "../helpers/types";
import { PNFXCommand } from "../Command";
import * as PNFXHelpers from "../helpers/functions"
import * as PNFXEmbeds from "../helpers/Embeds"
import * as PNFXTypes from "../helpers/types";
import PNFXMenu from "../helpers/Menu";
import { DiriceDBClient } from "../api/DiriceDBClient";
import { Character } from "../objects/Character";
import { CharacterAlreadyExistsError } from "../errors/CharacterAlreadyExistsError";

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
                    .setDescription("Switch to this character for any rolls (don't specify to reset).")
                    .addIntegerOption((option: SlashCommandIntegerOption) =>
                        option
                            .setName("roll-character")
                            .setDescription("The character you would like to switch to.")
                            .setRequired(false)
                            .setAutocomplete(true)
                    )
            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand
                .setName('modify-permssions-by-id')
                .setDescription("Set the permissions of a character.")
                .addIntegerOption((option: SlashCommandIntegerOption) =>
                    option
                        .setName("manage-character")
                        .setDescription("The character you would like to modify the permissions of.")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption((option: SlashCommandStringOption) =>
                option
                    .setName("user-to-modify")
                    .setDescription("The id of the user you would like to (un)invite to roll as/manage your character.")
                    .setRequired(true)
                 )
                .addBooleanOption((option: SlashCommandBooleanOption) =>
                option
                    .setName("can-roll")
                    .setDescription("Can this user roll as your character?")
                    .setRequired(false)
                )
                .addBooleanOption((option: SlashCommandBooleanOption) =>
                option
                    .setName("can-manage")
                    .setDescription("Can this user change the stat modifiers of, and other people to manage, your character?")
                    .setRequired(false)
                )
            
            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand
                .setName('modify-permssions-by-user')
                .setDescription("Set the permissions of a character.")
                .addIntegerOption((option: SlashCommandIntegerOption) =>
                    option
                        .setName("manage-character")
                        .setDescription("The character you would like to modify the permissions of.")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addUserOption((option: SlashCommandUserOption) =>
                option
                    .setName("user-to-modify")
                    .setDescription("The user you would like to (un)invite to roll as/manage your character.")
                    .setRequired(true)
                 )
                .addBooleanOption((option: SlashCommandBooleanOption) =>
                option
                    .setName("can-roll")
                    .setDescription("Can this user roll as your character?")
                    .setRequired(false)
                )
                .addBooleanOption((option: SlashCommandBooleanOption) =>
                option
                    .setName("can-manage")
                    .setDescription("Can this user change the stat modifiers of, and other people to manage, your character?")
                    .setRequired(false)
                )
            
            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand
                    .setName('create')
                    .setDescription("Create a character. These can all be changed later!")
                    .addStringOption((option: SlashCommandStringOption) =>
                    option
                        .setName("name")
                        .setDescription("The character's full name.")
                        .setRequired(true)
                    )
                    .addIntegerOption((option: SlashCommandIntegerOption) =>
                    option
                        .setName("link-campaign")
                        .setDescription("Link this character, and its stat options, to an existing campaign.")
                        .setRequired(true)
                        .setAutocomplete(true)
                    )
                    .addStringOption((option: SlashCommandStringOption) =>
                    option
                        .setName("description")
                        .setDescription("The character's description.")
                        .setRequired(false)
                    )
                    .addStringOption((option: SlashCommandStringOption) =>
                    option
                        .setName("quote")
                        .setDescription("A quote that the character said/would say.")
                        .setRequired(false)
                    )


            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand
                    .setName('info')
                    .setDescription("View the information of this character.")
                    .addIntegerOption((option: SlashCommandIntegerOption) =>
                        option
                            .setName("manage-character")
                            .setDescription("The character you would like to view.")
                            .setRequired(true)
                            .setAutocomplete(true)
                    )
            )

    }

    __RunSlashCommand: Function = async (client: Client, interaction: ChatInputCommandInteraction, EraserTail: EraserTailClient) => {
        const DiriceClient = new DiriceDBClient(interaction.user.id)
        let characterID: number | null = null;
        let charactersInDB: Character[] = [];
        const Player = (await DiriceClient.me());
        let userToModifyID: string | null = null;
        switch (interaction.options.getSubcommand()) {
            case "modify-permssions-by-id":
                userToModifyID = interaction.options.getString("user-to-modify", true);
            case "modify-permssions-by-user":
                if(!userToModifyID){
                    const userToModify = interaction.options.getUser("user-to-modify", true)
                    userToModifyID = userToModify.id;
                }
                characterID = interaction.options.getInteger("manage-character")
                if (characterID == null) {
                    await interaction.editReply({
                        embeds: [PNFXEmbeds.error("GENERAL_COMMAND_ERROR")]
                    });
                    return
                }
                charactersInDB = (await Player.getManageableCharacters()).filter((val: Character) => val.getID() == characterID)
                if (charactersInDB.length == 0) {
                    await interaction.editReply({
                        embeds: [PNFXEmbeds.error("CHARACTER_NOT_FOUND")]
                    });
                    return
                }
                if (charactersInDB.length > 1) {
                    await interaction.editReply({
                        embeds: [PNFXEmbeds.error("UNK", "charactersInDB.length > 1")]
                    });
                    EraserTail.log("Warn", "charactersInDB.length > 1 for character ID " + characterID)
                    return
                }
                const character = charactersInDB[0];
                
                const canRoll = interaction.options.getBoolean("can-roll")
                const canManage = interaction.options.getBoolean("can-manage")
                const charCurrentCanRollAs =character.getCanRollAs();
                const charCurrentCanManage =character.getCanManage();

                if((canRoll == true) && !charCurrentCanRollAs.includes(userToModifyID)){
                    charCurrentCanRollAs.push(userToModifyID);
                }
                if((canRoll == false) && charCurrentCanRollAs.includes(userToModifyID)){
                    charCurrentCanRollAs.splice(charCurrentCanRollAs.indexOf(userToModifyID), 1);
                }
                if((canManage == true) && !charCurrentCanManage.includes(userToModifyID)){
                    charCurrentCanManage.push(userToModifyID);
                }
                if((canManage == false) && charCurrentCanManage.includes(userToModifyID)){
                    charCurrentCanManage.splice(charCurrentCanManage.indexOf(userToModifyID), 1);
                }

                await DiriceClient.characters({ id: character.getID(),    
                    can_roll_as: charCurrentCanRollAs,
                    can_manage: charCurrentCanManage
                }).update()
                
                const canCurrentRollAs:(User|string)[] = [];
                const canCurrentManage:(User|string)[] = [];
                for (const id of charCurrentCanRollAs){
                    try {
                        const userMaybe = await client.users.fetch(id);
                        canCurrentRollAs.push(userMaybe)
                    } catch (error) {
                        canCurrentRollAs.push(id)
                    }
                }
                for (const id of charCurrentCanManage){
                    try {
                        const userMaybe = await client.users.fetch(id);
                        canCurrentManage.push(userMaybe)
                    } catch (error) {
                        canCurrentManage.push(id)
                    }
                }
                const listOfCanRoll = canCurrentRollAs.map((val:User|string) => val instanceof User?`${val.username} (${val.id})`:`??? (${val})`).join("\n");
                const listOfCanManage = canCurrentManage.map((val:User|string) => val instanceof User?`${val.username} (${val.id})`:`??? (${val})`).join("\n")
                const resultEmbed = PNFXEmbeds.success("Your permission settings have been committed.").setAuthor({ name: `Permissions for ${character.getName()}`, iconURL: character.getPhotoURL() }).setFields([{
                    name: "Can Roll",
                    value: listOfCanRoll != ""?listOfCanRoll:"*Nobody!*"
                },{
                    name: "Can Manage",
                    value: listOfCanManage != ""?listOfCanManage:"*Nobody!*"

                }]);
                await interaction.editReply({
                    embeds: [resultEmbed]
                });
                break;
            case "create":
                try {
                    const newChar = await Player.createCharacter({
                        name: interaction.options.getString("name")??undefined,
                        description: interaction.options.getString("description")??undefined,
                        quote: interaction.options.getString("quote")??undefined,
                        campaign_id: interaction.options.getInteger("link-campaign")??undefined,
                        owner_id: interaction.user.id
                    })
                    await newChar.fetchCampaign()
                    await interaction.editReply({
                        embeds: [PNFXEmbeds.success(`Character ${newChar.getName()} has been created under ${newChar.getCampaign().getName()}!`)]
                    });
                    await newChar.getCampaign().syncStatsWithCharacters()
                } catch (error) {
                    if(error instanceof CharacterAlreadyExistsError){
                        await interaction.editReply({
                            embeds: [PNFXEmbeds.error("CHARACTER_ALREADY_EXISTS")]
                        });
                        return;
                    }
                    throw error;
                }

                return;
            case "switch":
                characterID = interaction.options.getInteger("roll-character")
                if (characterID == null) {
                    await Player.updateSettings({ selected_character: null })
                    await interaction.editReply({
                        embeds: [PNFXEmbeds.success(`You will now roll generically.`)]
                    });
                    return;
                }
                charactersInDB = await Player.getRollableCharacters()
                
                break;
            case "info":
                characterID = interaction.options.getInteger("manage-character")
                charactersInDB = await Player.getManageableCharacters()
                break;
        }

        if (!characterID) {
            await interaction.editReply({
                embeds: [PNFXEmbeds.error("GENERAL_COMMAND_ERROR")]
            });
            return
        }
        charactersInDB = charactersInDB.filter((val: Character) => val.getID() == characterID)
        if (charactersInDB.length == 0) {
            await interaction.editReply({
                embeds: [PNFXEmbeds.error("CHARACTER_NOT_FOUND")]
            });
            return
        }

        if (charactersInDB.length > 1) {
            await interaction.editReply({
                embeds: [PNFXEmbeds.error("UNK", "charactersInDB.length > 1")]
            });
            EraserTail.log("Warn", "charactersInDB.length > 1 for character ID " + characterID)
            return
        }
        const character = charactersInDB[0];

        switch (interaction.options.getSubcommand()) {
            case "switch":
                await Player.updateSettings({ selected_character: character.getID() })
                await interaction.editReply({
                    embeds: [PNFXEmbeds.success(`You will now roll as ${character.getName()}.`)]
                });
                break;
            case "info":
                await interaction.editReply({
                    embeds: [PNFXEmbeds.error("NOT_CONFIGURED", "to be implemented...")]
                });
                break;
        }


    }

};
