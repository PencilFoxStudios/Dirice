/**
* Some helper functions for Discord.
*     @module PNFXHelpers
*     @org Pencil Fox Studios
*     @warning
*  **ATTENTION:** 
*
* Unauthorized use and/or distribution of this class, or the code that lies within, outside of the organization indicated above is a copyright violation, and may be pursued in the court of law on a case-by-case basis. You have been warned!*
*     @author Liam Shackhorn
*     @license LICENSE.MD
*/
import moment from "moment";
import { EraserTailClient } from "@pencilfoxstudios/erasertail"
import { ApplicationCommandType, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ColorResolvable, CommandInteraction, EmbedBuilder, Guild, GuildBan, GuildMember, Interaction, InteractionType, MessageContextMenuCommandInteraction, Role, UserContextMenuCommandInteraction } from "discord.js";
import PNFXMenu from "./Menu";
import * as PNFXTypes from "./types"
import * as PNFXEmbeds from "./Embeds"
import PNFXMember from "./Member";
/**
 * Converts a hex string to its equivalent ColorResolvable.
 * @param {string} hex
 * @returns {ColorResolvable} A ColorResolvable
 * @author Liam Shackhorn
 */
export function hexToColorResolvable(hex: string): ColorResolvable {
    return parseInt(hex.replace("#", "")).toString(16) as ColorResolvable;
}
/**
 * Converts a ColorResolvable to its equivalent hex string.
 * @param {ColorResolvable} color
 * @returns {string} A hex string
 * @author Liam Shackhorn
 */
export function colorResolvableToHex(color: ColorResolvable): string {
    return `${color}`.replace("0x", "#");
}
/**
 * Checks if a user is banned from a guild.
 * @param {string} userID
 * @param {Guild} guild
 * @param {EraserTailClient} EraserTail
 * @returns {Promise<GuildBan|null>} A GuildBan, or not.
 * @author Liam Shackhorn
 */
export async function isUserBanned(userID: string, guild: Guild, EraserTail: EraserTailClient): Promise<GuildBan | null> {
    try {
        const banList = await guild.bans.fetch();
        const isBanned = banList.get(userID)
        return isBanned ?? null
    } catch (err) {
        EraserTail.log("Error", err as object)
        return null
    }
}
/**
 * Checks if a user is in a guild.
 * @param {string} userID
 * @param {Guild} guild
 * @param {EraserTailClient} EraserTail
 * @returns {Promise<boolean>} A boolean representing whether the user is in the guild or not.
 * @author Liam Shackhorn
 */
export async function getUserInServer(userID: string, guild: Guild, EraserTail: EraserTailClient): Promise<GuildMember | null> {
    try {
        const memberList = await guild.members.fetch();
        const member = memberList.get(userID) ?? null
        return member
    } catch (err) {
        EraserTail.log("Error", err as object)
        return null
    }
}
/**
 * Checks if a user is timeout out in a guild.
 * @param {string} userID
 * @param {Guild} guild
 * @param {EraserTailClient} EraserTail
 * @returns {Promise<boolean>} A boolean representing whether the user is timed out or not.
 * @author Liam Shackhorn
 */
export async function isUserTimedOut(userID: string, guild: Guild, EraserTail: EraserTailClient): Promise<number | null> {
    try {
        const member = await getUserInServer(userID, guild, EraserTail);
        if (!member) return null;
        if (member.communicationDisabledUntil) {
            return member.communicationDisabledUntilTimestamp
        } else {
            return null
        }
    } catch (err) {
        EraserTail.log("Error", err as object)
        return null
    }
}
/**
 * Checks if a user is a moderator in a guild, based on an environment variable.
 * @param {string} userID
 * @param {Guild} guild
 * @param {EraserTailClient} EraserTail
 * @returns {Promise<boolean>} A boolean representing whether the user is a moderator or not, depending on the MODERATOR_ROLE_ID
 * @author Liam Shackhorn
 * @deprecated Please use getUserStaffRole instead.
 */
export async function isUserModerator(userID: string, guild: Guild, EraserTail: EraserTailClient): Promise<boolean> {
    /* To be implemented */
    try {
        const member = await getUserInServer(userID, guild, EraserTail);
        if (!member) return false;
        const isModerator = member.roles.cache.some(role => role.id === process.env.MODERATOR_ROLE_ID)
        return isModerator
    } catch (err) {
        EraserTail.log("Error", err as object)
        return false
    }
}
/**
 * Gets a user's staff role based on their current roles in a guild.
 * @param {string} userID
 * @param {Guild} guild
 * @param {EraserTailClient} EraserTail
 * @returns {Promise<PNFXTypes.PNFXStaffRole | null>} A PNFXStaffRole or null, depending on if there were any matching roles or not.
 * @author Liam Shackhorn
 */
export async function getUserStaffRole(userID: string, guild: Guild, EraserTail: EraserTailClient): Promise<PNFXTypes.PNFXStaffRole | null> {
    /* To be implemented */
    const staffRoles: PNFXTypes.PNFXStaffRole[] = [
        {
            name: "MemberRole",
            role_id: "1043990158418137128",
            level: "MEMBER"
        },
        {
            name: "ModRole",
            role_id: "1043990222796509245",
            level: "MOD"
        },
        {
            name: "AdminRole",
            role_id: "1043990228064555088",
            level: "ADMIN"
        },
    ]
    try {
        const member = await getUserInServer(userID, guild, EraserTail);
        if (!member) return null;
        var highestStaffRole: PNFXTypes.PNFXStaffRole | null = null;
        for (let role of member.roles.cache.toJSON().reverse()) {
            for (let staffRole of staffRoles) {
                if (role.id == staffRole.role_id) {
                    highestStaffRole = staffRole
                    break;
                }
            }
            if (highestStaffRole) {
                break;
            }
        }
        return highestStaffRole
    } catch (err) {
        EraserTail.log("Error", err as object)
        return null
    }
}
