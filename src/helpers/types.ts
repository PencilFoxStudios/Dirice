export interface PNFX_EXAMPLE_TYPE {
  EXAMPLE: "THIS IS JUST AN EXAMPLE TYPE" | "FEEL FREE TO ADD YOUR OWN!!" | "YIP YIP!",
}

export type PNFXCommandSupportString = "SLASH" | "USER_CONTEXT" | "MESSAGE_CONTEXT"

export type PNFXMemberPermissionString = "WARN" | "KICK" | "BAN" | "VIEW_HISTORY" | "MODIFY_HISTORY" | "TIMEOUT" | "UNTIMEOUT" | "ADD_NOTES" | "GET_NOTES" | "MAKE_REPORT" | "RESTRAIN_USER" | "UNBAN"
export interface PNFXStaffRole {
  name: string;
  role_id: string;
  level: "MEMBER" | "MOD" | "ADMIN";
}
export const PNFXBotError = {
  "DMS_FORBIDDEN": {
    PRETTY: "**Unavailable in DMs**\nSorry, this bot does not accept commands in Direct Messages at this time. Please try again in a server!",
    RAW: "Sorry, this bot does not accept commands in Direct Messages at this time. Please try again in a server!"
  },
  "COMMAND_NOT_FOUND": {
    PRETTY: "**That command is currently unavailable**\nIf you believe this is an error, please contact the developers.",
    RAW: "That command is currently unavailable"
  },
  "NOT_CONFIGURED": {
    PRETTY: "**This command is not configured for this method of use.**\nIf you believe this is an error, please contact the developers.",
    RAW: "Unconfigured command usage."
  },
  "STAT_NOT_FOUND": {
    PRETTY: "**The specified stat could not be found on the character.**",
    RAW: "Stat not found."
  },
  "CHARACTER_NOT_FOUND": {
    PRETTY: "**The specified character could not be found.**\nDo you have permission to manage/roll for it?",
    RAW: "Character not found."
  },
  "CHARACTER_ALREADY_EXISTS": {
    PRETTY: "**The character you're attempting to create appears to already exist in this campaign...**\nTry changing some details!",
    RAW: "Character already exists."
  },
  "USER_NOT_FOUND": {
    PRETTY: "**The specified user could not be found.**\nThey may have either left the server, my cache, or both!",
    RAW: "User not found."
  },
  "GENERAL_COMMAND_ERROR": {
    PRETTY: "**Action could not be completed.**\nPossible reasons for this are you not having enough permissions or some API is down. Please start over for the most up-to-date options.",
    RAW: "Action failed."
  },
  "NO_OPTIONS_AVAILABLE": {
    PRETTY: "**No Options Available**\nGiven the current circumstances, there are no further actions available.",
    RAW: "No actions available."
  },
  "UNK": {
    PRETTY: "**Unknown Error**\nPlease contact the developers!",
    RAW: "Unknown Error!"
  }
}

export type PNFXBotErrorCode = (keyof typeof PNFXBotError)