import { ColorResolvable, EmbedBuilder, EmbedField, User } from 'discord.js'
import moment from 'moment'
import * as PNFXTypes from "./types"
import {RollResult } from "../objects/Roll"
export function error(code: PNFXTypes.PNFXBotErrorCode = "UNK", moreInfo?: string): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setColor(0xda4453)
        .setTitle("An error has occurred.")
        .setDescription(PNFXTypes.PNFXBotError[code].PRETTY)
        .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Flat_cross_icon.svg/768px-Flat_cross_icon.svg.png")
        .setFooter({
            text: `Error Code: ${code}`
        })
    if(moreInfo){
        embed.addFields({
            name: "Hint",
            value: moreInfo
        })
    }
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
export function loading(loadingText: string = "Processing...") {
    const embed = new EmbedBuilder()
        .setColor(0x6215af)
        .setTitle("Please wait...")
        .setDescription(loadingText)
        .setThumbnail("https://i.ibb.co/5KPjPZS/diceload.gif")
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
export function rollingResult (rolls:RollResult[]){
    let rollStrings:string[] = [];
    const embed = new EmbedBuilder();
    embed.setColor(0xdd2e44)
    if(rolls.length == 1){
        const oneRoll = rolls[0];
        let ModifierInfo = null;
        if(oneRoll.Modifier !== 0){
            ModifierInfo = ((oneRoll.Modifier < 0)?" - " + Math.abs(oneRoll.Modifier):" + " + Math.abs(oneRoll.Modifier)) + `\n# ${oneRoll.FinalRoll}`;
        }
        if(ModifierInfo){
            embed.setDescription(`### 🎲 [${oneRoll.NaturalRoll}]${ModifierInfo}`)
        }else{
            embed.setDescription(`# 🎲 [${oneRoll.NaturalRoll}]`)
        }
        
        return embed;
    }
    console.log(rolls)
    let specials: {nMinimum?:number, nMaximum?:number, minimum?:number,maximum?:number, nTotal:number , total:number, modifier?:number} = {
        nMinimum: undefined,
        nMaximum: undefined,
        minimum: undefined,
        maximum: undefined,
        nTotal: 0,
        total: 0,
        modifier: undefined
    }
    for (let i = 0; (i < rolls.length); i++){
        if(specials.modifier == undefined){
            specials.modifier = rolls[i].Modifier
        }

        if(specials.nMinimum == undefined){
            specials.nMinimum = rolls[i].NaturalRoll;
        }
        if(specials.nMaximum == undefined){
            specials.nMaximum = rolls[i].NaturalRoll;
        }
        if(specials.minimum == undefined){
            specials.minimum = rolls[i].FinalRoll;
        }
        if(specials.maximum == undefined){
            specials.maximum = rolls[i].FinalRoll;
        }

        if(rolls[i].NaturalRoll < specials.nMinimum){
            specials.nMinimum = rolls[i].NaturalRoll;
        }
        if(rolls[i].NaturalRoll > specials.nMaximum){
            specials.nMaximum = rolls[i].NaturalRoll;
        }
        if(rolls[i].FinalRoll < specials.minimum){
            specials.minimum = rolls[i].FinalRoll;
        }
        if(rolls[i].FinalRoll > specials.maximum){
            specials.maximum = rolls[i].FinalRoll;
        }
        specials.total += rolls[i].FinalRoll;
        specials.nTotal += rolls[i].NaturalRoll;
        const roll = rolls[i];
        let modifierInfo = "";
        if(roll.Modifier !== 0){
            modifierInfo = ((roll.Modifier < 0)?" - " + Math.abs(roll.Modifier):" + " + Math.abs(roll.Modifier)) + ` => **${roll.FinalRoll}**`;
        }
        if(i < 20){
            rollStrings.push(`**#${i+1}** 🎲 [${roll.NaturalRoll}]${modifierInfo}`)
        }
        
    }
    let desc = "";
    if(rolls.length > 20){
        desc += `## The first 20/${rolls.length} rolls are shown below.\n`
        embed.setFields([
            {
                name: "Natural Minimum",
                value: `${specials.nMinimum}`,
                inline: true
            },
            {
                name: "Natural Maximum",
                value: `${specials.nMaximum}`,
                inline: true
            },
            {
                name: "Natural Average",
                value: `${Math.floor(specials.nTotal/rolls.length)}`,
                inline: true
            },
        ])
        if(specials.modifier !== 0){
            embed.addFields([
            {
                name: "Final Minimum",
                value: `${specials.minimum}`,
                inline: true
            },
            {
                name: "Final Maximum",
                value: `${specials.maximum}`,
                inline: true
            },
            {
                name: "Final Average",
                value: `${Math.floor(specials.total/rolls.length)}`,
                inline: true
            }
        ])
        }
    }
    desc += rollStrings.join("\n")
    embed.setDescription(desc);

    return embed;
}