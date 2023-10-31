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
import { CampaignAlreadyExistsError, CharacterAlreadyExistsError } from "../errors/Errors";
import { Campaign } from "../objects/Campaign";

export class Campaigns extends PNFXCommand {
    constructor() {
        super(
            // Command Name
            "campaigns",
            // Command Description
            "Manage campaigns!",
            // Supported Methods of Running
            ["SLASH"],
            // Should I make the user the only one able to see the reply?
            false
        );
        (this.SlashCommand as SlashCommandBuilder)
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand
                    .setName('switch')
                    .setDescription("Switch to this campaign for any management features.")
                    .addIntegerOption((option: SlashCommandIntegerOption) =>
                        option
                            .setName("manage-campaign")
                            .setDescription("The campaign you would like to switch to.")
                            .setRequired(false)
                            .setAutocomplete(true)
                    )
            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand
                    .setName('kick-character')
                    .setDescription("Forcefully unlinks the specified character from the campaign.")
                    .addIntegerOption((option: SlashCommandIntegerOption) =>
                        option
                            .setName("character-from-campaign")
                            .setDescription("The character you would like to unlink from the campaign.")
                            .setRequired(true)
                            .setAutocomplete(true)
                    )

            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand
                    .setName('modify-permssions-by-id')
                    .setDescription("Set a user's permissions in your campaign.")
                    .addStringOption((option: SlashCommandStringOption) =>
                        option
                            .setName("user-to-modify")
                            .setDescription("The user you would like to (un)invite to manage your campaign.")
                            .setRequired(true)
                    )
                    .addBooleanOption((option: SlashCommandBooleanOption) =>
                        option
                            .setName("can-manage")
                            .setDescription("Can this user change the default stats, as well as change the details of, your campaign?")
                            .setRequired(true)
                    )

            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand
                    .setName('modify-permssions-by-user')
                    .setDescription("Set a user's permissions in your campaign.")
                    .addUserOption((option: SlashCommandUserOption) =>
                        option
                            .setName("user-to-modify")
                            .setDescription("The user you would like to (un)invite to manage your campaign.")
                            .setRequired(true)
                    )
                    .addBooleanOption((option: SlashCommandBooleanOption) =>
                        option
                            .setName("can-manage")
                            .setDescription("Can this user change the default stats, as well as change the details of, your campaign?")
                            .setRequired(true)
                    )

            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand
                    .setName('create')
                    .setDescription("Create a campaign. These can all be changed later!")
                    .addStringOption((option: SlashCommandStringOption) =>
                        option
                            .setName("name")
                            .setDescription("The campaign's full name.")
                            .setRequired(true)
                    )
                    .addStringOption((option: SlashCommandStringOption) =>
                        option
                            .setName("description")
                            .setDescription("The campaign's description.")
                            .setRequired(false)
                    )
                    .addAttachmentOption((option: SlashCommandAttachmentOption) =>
                        option
                            .setName("photo")
                            .setDescription("The campaign's photo.")
                            .setRequired(false)
                    )


            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand
                    .setName('info')
                    .setDescription("View the information of your campaign.")
                    .addIntegerOption((option: SlashCommandIntegerOption) =>
                        option
                            .setName("manage-campaign")
                            .setDescription("The campaign you would like to view.")
                            .setRequired(true)
                            .setAutocomplete(true)
                    )
            )

    }

    __RunSlashCommand: Function = async (client: Client, interaction: ChatInputCommandInteraction, EraserTail: EraserTailClient) => {
        const DiriceClient = new DiriceDBClient(interaction.user.id)
        let campaignID: number | null = null;
        let campaignsInDB: Campaign[] = [];
        const Player = (await DiriceClient.me());
        let userToModifyID: string | null = null;
        switch (interaction.options.getSubcommand()) {
            case "modify-permssions-by-id":
                userToModifyID = interaction.options.getString("user-to-modify", true);
            case "modify-permssions-by-user":
                if (!userToModifyID) {
                    const userToModify = interaction.options.getUser("user-to-modify", true)
                    userToModifyID = userToModify.id;
                }
                campaignID = interaction.options.getInteger("manage-campaign")
                if (campaignID == null) {
                    await interaction.editReply({
                        embeds: [PNFXEmbeds.error("GENERAL_COMMAND_ERROR")]
                    });
                    return
                }
                if(campaignID == 0){
                    await interaction.editReply({
                        embeds: [PNFXEmbeds.error("CAMPAIGN_NOT_FOUND")]
                    });
                    return
                }
                campaignsInDB = (await Player.getManageableCampaigns()).filter((val: Campaign) => val.getID() == campaignID)
                if (campaignsInDB.length == 0) {
                    await interaction.editReply({
                        embeds: [PNFXEmbeds.error("CAMPAIGN_NOT_FOUND")]
                    });
                    return
                }
                if (campaignsInDB.length > 1) {
                    await interaction.editReply({
                        embeds: [PNFXEmbeds.error("UNK", "campaignsInDB.length > 1")]
                    });
                    EraserTail.log("Warn", "campaignsInDB.length > 1 for campaign ID " + campaignID)
                    return
                }
                const campaign = campaignsInDB[0];

                const canManage = interaction.options.getBoolean("can-manage")
                const campCurrentCanManage = campaign.getCanManage();


                if ((canManage == true) && !campCurrentCanManage.includes(userToModifyID)) {
                    campCurrentCanManage.push(userToModifyID);
                }
                if ((canManage == false) && campCurrentCanManage.includes(userToModifyID)) {
                    campCurrentCanManage.splice(campCurrentCanManage.indexOf(userToModifyID), 1);
                }

                await DiriceClient.campaigns({
                    id: campaign.getID(),
                    manager_ids: campCurrentCanManage
                }).update()

                const canCurrentManage: (User | string)[] = [];

                for (const id of campCurrentCanManage) {
                    try {
                        const userMaybe = await client.users.fetch(id);
                        canCurrentManage.push(userMaybe)
                    } catch (error) {
                        canCurrentManage.push(id)
                    }
                }
                const listOfCanManage = canCurrentManage.map((val: User | string) => val instanceof User ? `${val.username} (${val.id})` : `??? (${val})`).join("\n")
                const resultEmbed = PNFXEmbeds.success("Your permission settings have been committed.").setAuthor({ name: `Permissions for ${campaign.getName()}`, iconURL: campaign.getPhotoURL()??undefined }).setFields([
                     {
                    name: "Can Manage",
                    value: listOfCanManage != "" ? listOfCanManage : "*Nobody!*"

                }]);
                await interaction.editReply({
                    embeds: [resultEmbed]
                });
                break;
            case "create":
                try {
                    const photo = interaction.options.getAttachment("photo");
                    // Upload photo to supabase "photos" bucket under "campaigns" folder.
                    
                    const newCampaign = await Player.createCampaign({
                        name: interaction.options.getString("name") ?? undefined,
                        description: interaction.options.getString("description") ?? undefined,
                        dm_id: interaction.user.id
                    })
                    function predictExtensionBasedOnContentType(ct:string){
                        switch(ct){
                            case "image/png":
                                return ".png";
                            case "image/jpeg":
                                return ".jpg";
                            case "image/gif":
                                return ".gif";
                            case "image/webp":
                                return ".webp";
                            default:
                                return "";
                        }
                    }
                    const photoURL = photo ? await DiriceClient.uploadPhoto("campaigns", photo, `U${interaction.user.id}_C${newCampaign.getID()}${photo?.name?photo.name.split(".").pop():`${predictExtensionBasedOnContentType(photo.contentType!)}`}`) : null;
                    await DiriceClient.campaigns({ id: newCampaign.getID(), photo_url: photoURL ?? undefined }).update()
                    const successEmbed = PNFXEmbeds.success(`Campaign ${newCampaign.getName()} has been created!`);
                    if (photoURL) {
                        successEmbed.setThumbnail(photoURL)
                    }
                    await interaction.editReply({
                        embeds: [successEmbed]
                    });
                } catch (error) {
                    if (error instanceof CampaignAlreadyExistsError) {
                        await interaction.editReply({
                            embeds: [PNFXEmbeds.error("CAMPAIGN_ALREADY_EXISTS")]
                        });
                        return;
                    }
                    throw error;
                }

                return;
            default:
                campaignID = interaction.options.getInteger("manage-campaign")
                campaignsInDB = await Player.getManageableCampaigns()

                break;
        }

        if (!campaignID) {
            await interaction.editReply({
                embeds: [PNFXEmbeds.error("GENERAL_COMMAND_ERROR")]
            });
            return
        }
        campaignsInDB = campaignsInDB.filter((val: Campaign) => val.getID() == campaignID)
        if (campaignsInDB.length == 0) {
            await interaction.editReply({
                embeds: [PNFXEmbeds.error("CAMPAIGN_NOT_FOUND")]
            });
            return
        }

        if (campaignsInDB.length > 1) {
            await interaction.editReply({
                embeds: [PNFXEmbeds.error("UNK", "campaignsInDB.length > 1")]
            });
            EraserTail.log("Warn", "campaignsInDB.length > 1 for campaign ID " + campaignID)
            return
        }
        const campaign = campaignsInDB[0];

        switch (interaction.options.getSubcommand()) {
            case "switch":
                await Player.updateSettings({ selected_campaign: campaign.getID() })
                await interaction.editReply({
                    embeds: [PNFXEmbeds.success(`You are now managing ${campaign.getName()}.`)]
                });
                break;
            case "info":
                await campaign.fetchCharacters();
                await campaign.fetchRolls();
                await interaction.editReply({
                    embeds: [PNFXEmbeds.campaignInfoEmbed(campaign)]
                })
                break;
        }


    }

};
