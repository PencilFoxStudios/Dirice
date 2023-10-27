import { ColorResolvable, EmbedBuilder, EmbedField, User } from 'discord.js'
import moment from 'moment'
import * as PNFXTypes from "./types"

export function error(code: PNFXTypes.PNFXBotErrorCode = "UNK"): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setColor(0xda4453)
        .setTitle("An error has occurred.")
        .setDescription(PNFXTypes.PNFXBotError[code].PRETTY)
        .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Flat_cross_icon.svg/768px-Flat_cross_icon.svg.png")
        .setFooter({
            text: `Error Code: ${code}`
        })
    return embed
}

export function success(text: string = "The action was proformed successfully!") {
    const embed = new EmbedBuilder()
        .setColor(0x2acd72)
        .setTitle("Success!")
        .setDescription(text)
        .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Sign-check-icon.png/800px-Sign-check-icon.png")
    return embed
}
export function info(title: string | null = null, information: string | null = null, color: ColorResolvable = 0x4fc1f1) {
    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(information)
    return embed
}
export function user(user: User | null, customText = user?.tag ?? "Unknown User") {
    const embed = new EmbedBuilder()
        .setColor(0x1e1e79)
        .setAuthor({
            iconURL: user?.avatarURL() ?? undefined,
            name: customText
        })
    return embed
}