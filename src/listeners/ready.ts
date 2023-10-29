import { ApplicationCommandData, ApplicationCommandDataResolvable, ApplicationCommandOptionData, ApplicationCommandType, ChatInputApplicationCommandData, Client, CommandOptionDataTypeResolvable, MessageApplicationCommandData, RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, StringMappedInteractionTypes, UserApplicationCommandData } from "discord.js";
import { Commands } from "../Commands";
import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { PNFXCommand } from "../Command";
export default (client: Client, EraserTail: EraserTailClient): void => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }
        let ShippedCommands: (UserApplicationCommandData | MessageApplicationCommandData | ChatInputApplicationCommandData)[] = []
        Commands.forEach((command: PNFXCommand) => {
            if (command.supports.includes("SLASH")) {
                ShippedCommands.push((command.SlashCommand as SlashCommandBuilder).toJSON())
            }
            if (command.supports.includes("USER_CONTEXT")) {
                ShippedCommands.push({ name: command.name, type: ApplicationCommandType.User })
            }

            if (command.supports.includes("MESSAGE_CONTEXT")) {
                ShippedCommands.push({ name: command.name, type: ApplicationCommandType.Message })
            }

        })
        await client.application.commands.set(ShippedCommands);
        client.user.setPresence({
            status: "idle",
            activities: [
                {
                    name: "for rolls",
                    type: 3,
                }
            ],

        })
        EraserTail.log("Info", `${client.user.username} is online`);
    });
};