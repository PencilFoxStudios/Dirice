import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { Guild, GuildMember, User } from "discord.js"
import * as PNFXHelpers from "./functions";
import { PNFXMemberPermissionString, PNFXStaffRole } from "./types";
/**
* Custom handler for action permissions, based on the member and the guild the action was requested on.
*     @org Pencil Fox Studios
*     @warning
*  **ATTENTION:** 
*
* Unauthorized use and/or distribution of this class, or the code that lies within, outside of the organization indicated above is a copyright violation, and may be pursued in the court of law on a case-by-case basis. You have been warned!*
*     @author Liam Shackhorn
*     @license LICENSE.MD
*/
export default class PNFXMember {
    private __user: User;
    private __guild: Guild;
    private __member: GuildMember | null = null;
    private __userStaffRole: PNFXStaffRole | null = null;
    private __permissions: PNFXMemberPermissionString[] = [];
    private __EraserTail: EraserTailClient;
    /**
    * Constructor for PNFXMember Class
    *     @param {User} user The user who is running the action.
    *     @param {Guild} guild The guild that the user is running the action in.
    *     @param {EraserTailClient} EraserTail An active, valid Pencil Fox EraserTail client.
    *     @author Liam Shackhorn
    *     @org Pencil Fox Studios
    */
    constructor(user: User, guild: Guild, EraserTail: EraserTailClient) {
        this.__user = user
        this.__guild = guild
        this.__EraserTail = EraserTail
        this.__guild.members.fetch(this.__user.id).then((member: GuildMember) => {
            this.__member = member
        })
            .catch((err) => {
                this.__member = null
            })
        PNFXHelpers.getUserStaffRole(this.__user.id, this.__guild, this.__EraserTail).then((staffRole) => {
            this.__userStaffRole = staffRole
        })

    }
    /**
     * Checks if the PNFXMember has a permission.
     * @param {PNFXMemberPermissionString} perm A valid PNFXMember permission string.
     * @returns {Promise<boolean>} A boolean representing whether or not the PNFXMember has that permission
     * @author Liam Shackhorn
     */
    async hasPermission(perm: PNFXMemberPermissionString): Promise<boolean> {
        const userStaffRole = this.__userStaffRole
        if (!userStaffRole) return false;
        switch (userStaffRole.level) {
            case "ADMIN":
                this.__permissions = ["BAN", "KICK", "MODIFY_HISTORY", "ADD_NOTES", "TIMEOUT", "UNTIMEOUT", "VIEW_HISTORY", "RESTRAIN_USER", "UNBAN", "MAKE_REPORT", "RESTRAIN_USER"] as PNFXMemberPermissionString[]
                break;
            case "MOD":
                this.__permissions = ["BAN", "KICK", "MODIFY_HISTORY", "ADD_NOTES", "TIMEOUT", "UNTIMEOUT", "VIEW_HISTORY", "RESTRAIN_USER", "UNBAN", "MAKE_REPORT", "RESTRAIN_USER"] as PNFXMemberPermissionString[]
                break;
            case "MEMBER":
                this.__permissions = ["MAKE_REPORT"] as PNFXMemberPermissionString[]
                break;
            default:
                break;
        }

        return this.__permissions.includes(perm)
    }
    notes(member: GuildMember) {
        return {
            add: async (note: string): Promise<boolean> => {
                if (!(await this.hasPermission("ADD_NOTES"))) return false;
                return true
            },
            get: async (): Promise<boolean> => {
                if (!(await this.hasPermission("GET_NOTES"))) return false;
                return true
            },
        }
    }
    async warn(member: GuildMember, reason: string = "No reason specified."): Promise<boolean> {
        if (!(await this.hasPermission("WARN"))) return false;
        return true
    }
    async kick(member: GuildMember, reason: string = "No reason specified."): Promise<boolean> {
        if (!(await this.hasPermission("KICK"))) return false;
        let kicked = await member.kick(`This action was done on behalf of ${this.__user.tag}` + (reason == "No reason specified." ? "." : `: "${reason}"`)).catch((err) => {
            this.__EraserTail.log("Warn", err)
            return false
        })
        if (!kicked) return false
        return true
    }
    async timeout(member: GuildMember, reason: string = "No reason specified."): Promise<boolean> {
        if (!(await this.hasPermission("TIMEOUT"))) return false;
        return true
    }
    async untimeout(member: GuildMember, reason: string = "No reason specified."): Promise<boolean> {
        if (!(await this.hasPermission("UNTIMEOUT"))) return false;
        return true
    }
    async ban(member: GuildMember, reason: string = "No reason specified."): Promise<boolean> {
        if (!(await this.hasPermission("BAN"))) return false;
        return true
    }


}