import { Client, IntentsBitField } from "discord.js";
import { EraserTailClient } from "@pencilfoxstudios/erasertail"
import ready from "./listeners/ready";
import interactionCreate from "./listeners/interactionCreate";
import 'dotenv/config'
const EraserTail = new EraserTailClient({
  APPLICATION_NAME: "DIRICE",
  APPLICATION_NAME_HUMAN: "Dirice",
  APPLICATION_COLOR_PRIMARY: "#36393f",
  APPLICATION_COLOR_SECONDARY: "#ffffff",
  APPLICATION_PREFIX: "DIRICE >> ",
  APPLICATION_LOGGING_STYLES: null,
  APPLICATION_ICON: "https://media.discordapp.net/attachments/1028722861428441098/1031362596110082149/pencilfox_icon.png",
  LOG_TO_CLOUD: true,
  APPLICATION_SERVICES: [
    {
      SERVICE_NAME: "MAIN",
      SERVICE_NAME_HUMAN: "Main Bot",
      SERVICE_STATUS: "UP"
    }
  ],
  AUTO_HEARTBEAT: true,
  AUTO_HEARTBEAT_INTERVAL: null,
})
EraserTail.log("Info", "Bot is starting...");

const client = new Client({
  intents: [IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.GuildBans]
});
ready(client, EraserTail);
interactionCreate(client, EraserTail);

client.login(process.env.DISCORD_BOT_TOKEN);