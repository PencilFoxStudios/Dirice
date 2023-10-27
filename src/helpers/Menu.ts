import { ColorResolvable, EmbedBuilder, EmbedField, User, MessageComponentBuilder, MessageActionRowComponentBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ActionRow, SelectMenuComponentOptionData, Message, Embed, ComponentType, SelectMenuComponent, EmbedData, SelectMenuComponentData, ButtonComponentData, ButtonComponent, MessageActionRowComponent, APIButtonComponent, AnyComponentBuilder, MessagePayload, InteractionUpdateOptions } from 'discord.js'
import moment from 'moment'
import * as PNFXEmbeds from "./Embeds"
import * as PNFXTypes from "./types";
import * as PNFXHelpers from "./functions"
const shader = require("shader")
function removeItemOnce(arr: any[], index: any) {
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

/**
* Generates a nice-looking, interactive menu in the form of a bot Discord message.
*     @org Pencil Fox Studios
*     @warning
*  **ATTENTION:** 
*
* Unauthorized use and/or distribution of this class, or the code that lies within, outside of the organization indicated above is a copyright violation, and may be pursued in the court of law on a case-by-case basis. You have been warned!*
*     @author Liam Shackhorn
*     @license LICENSE.MD
*/
export default class PNFXMenu {
    private __messageContent = "";
    private __embedList: (EmbedBuilder)[] = [];
    private __selectMenuList: SelectMenuBuilder[] = [];
    private __buttonList: ButtonBuilder[] = [];
    private __baseColor: string
    private __dontOverrideColor: boolean
    /**
    * Constructor for PNFXMenu Class
    *     @param {string} baseColor The base embed color that will only get darker as more components are added on.
    *     @param {boolean} dontOverrideColor (default: false) Don't override the color of the embeds you give us
    *     @param {Message|null} previousMessage The unupdated menu's Message object, if you would like to not start from scratch.
    *     @author Liam Shackhorn
    *     @org Pencil Fox Studios
    */
    constructor(baseColor: string, dontOverrideColor: boolean = false, previousMessage: Message | null = null) {
        this.__baseColor = baseColor
        this.__dontOverrideColor = dontOverrideColor
        if (previousMessage) {

            for (var embed of previousMessage.embeds) {
                this.__embedList.push(new EmbedBuilder(embed.data as EmbedData))
            }
            this.__messageContent = previousMessage.content


            /*
            * This was so unnecessary. 
            * God. I hate everything.
            */
            if (previousMessage.components.length !== 0) {
                let selectmenucomponents = previousMessage.components.filter((component) => component.components[0].type == ComponentType.SelectMenu);
                let buttoncomponents = previousMessage.components.filter((component) => component.components[0].type == ComponentType.Button)

                if (selectmenucomponents.length != 0) {
                    let SelectActionRowBuilders: (ActionRowBuilder<SelectMenuBuilder>)[] = selectmenucomponents.map((ActionRow: any) => {
                        return ActionRowBuilder.from(ActionRow) as ActionRowBuilder<SelectMenuBuilder>
                    })
                    this.__selectMenuList = SelectActionRowBuilders[0].components.map((menu: SelectMenuBuilder, index: number) => {
                        return menu
                    })

                }

                if (buttoncomponents.length != 0) {
                    let ButtonActionRowBuilders: (ActionRowBuilder<ButtonBuilder>)[] = buttoncomponents.map((ActionRow: any) => {
                        return ActionRowBuilder.from(ActionRow) as ActionRowBuilder<ButtonBuilder>
                    })


                    this.__buttonList = ButtonActionRowBuilders[0].components.map((menu: ButtonBuilder, index: number) => {
                        return menu
                    })
                }


            }


        }
    }
    /** 
    * Sets the menu message's content.
    * @author Liam Shackhorn
    * @param {string} content - The desired message content. 
    */
    setMessageContent(content: string) {
        this.__messageContent = content;
    }
    /** 
    * Add the desired embed to the menu.
    * @author Liam Shackhorn
    * @param {EmbedBuilder} embed - The EmbedBuilder you would like to add.
    */
    addEmbed(embed: EmbedBuilder) {
        if (!this.__dontOverrideColor) {
            embed.setColor(
                this.__baseColor as ColorResolvable
            )
            let colorHex = shader(
                this.__baseColor,
                -0.2
            )
            this.__baseColor = colorHex
        }
        this.__embedList.push(embed)
    }
    /** 
    * Gets the desired embed from the menu.
    * @author Liam Shackhorn
    * @param {number} index - The index of the Embed you would like to retrieve.
    * @returns {EmbedBuilder} - The EmbedBuilder object associated with the index.
    */
    getEmbed(index: number): EmbedBuilder {
        return this.__embedList[index]
    }
    /** 
    * Edits the desired embed from the menu.
    * @author Liam Shackhorn
    * @param {number} index - The index of the Embed you would like to edit.
    * @param {Function} editFunc - The function to edit the embed in. Be sure to return the embed in it!
    */
    editEmbed(index: number, editFunc: Function) {
        this.__embedList[index] = editFunc(this.__embedList[index])
    }
    /** 
    * Removes the desired embed from the menu.
    * @author Liam Shackhorn
    * @param {number} index - The index of the Embed you would like to remove.
    */
    deleteEmbed(index: number) {
        removeItemOnce(this.__embedList, index)
    }
    /** 
    * Removes all embeds from the menu.
    * @author Liam Shackhorn
    */
    deleteAllEmbeds() {
        this.__embedList = []
    }
    /** 
    * Adds a button to the menu.
    * @author Liam Shackhorn
    * @param {string} buttonTitle - The **title** of the Button you would like to add.
    * @param {string} customId - The **customId** of the Button you would like to add.
    * @param {ButtonStyle} style - The **style** of the Button you would like to add.
    * @param {string|undefined} emoji - The (optional) **emoji** of the Button you would like to add.
    * @param {boolean} disabled - Render the button as disabled. (Default: False)
    */
    addButton(buttonTitle: string, customId: string, style: ButtonStyle, emoji: string | undefined = undefined, disabled: boolean | undefined = false) {
        const button = new ButtonBuilder()
            .setCustomId(customId)
            .setStyle(style)
            .setLabel(buttonTitle)
            .setDisabled(disabled)
        if (emoji) {
            button.setEmoji(emoji)
        }
        this.__buttonList.push(button)
    }
    /** 
    * Gets the desired button from the menu.
    * @author Liam Shackhorn
    * @param {number} index - The **index** of the Button you would like to get.
    * @returns {ButtonBuilder}
    */
    getButton(index: number): ButtonBuilder {
        return this.__buttonList[index]
    }
    /** 
    * Edits the desired button from the menu.
    * @author Liam Shackhorn
    * @param {number} index - The **index** of the Button you would like to edit.
    * @param {Function} editFunc - The **function** to edit the button in. Be sure to return the button in it!
    */
    editButton(index: number, editFunc: Function) {
        this.__buttonList[index] = editFunc(this.__buttonList[index])
    }
    /** 
    * Removes a button from the menu.
    * @author Liam Shackhorn
    * @param {number} index - The **index** of the Button you would like to remove.
    */
    deleteButton(index: number) {
        removeItemOnce(this.__buttonList, index)
    }
    /** 
    * Removes all buttons from the menu.
    * @author Liam Shackhorn
    */
    deleteAllButtons() {
        this.__buttonList = []
    }
    /** 
    * Adds a select to the menu.
    * @author Liam Shackhorn
    * @param {string} customId - The **customId** of the select menu you would like to add.
    * @param {string} placeholder - The **placeholder text** of the select menu you would like to add.
    * @param {...SelectMenuComponentOptionData[]} options - The choices you would like to add to the select menu, with a spread operator.
    */
    addSelectMenu(customId: string, placeholder: string = "Nothing selected!", ...options: SelectMenuComponentOptionData[]) {
        var menu = new SelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .addOptions(
                ...options
            );
        this.__selectMenuList.push(menu)
    }
    /** 
    * Edits the desired select from the menu.
    * @author Liam Shackhorn
    * @param {number} index - The index of the Select you would like to edit.
    * @param {Function} editFunc - The function to edit the Select in. Be sure to return the Select in it!
    */
    editSelectMenu(index: number = 0, editFunc: Function) {
        this.__selectMenuList[index] = editFunc(this.__selectMenuList[index])
    }
    /** 
    * Removes a select from the menu.
    * @author Liam Shackhorn
    * @param {number} index - The index of the select you would like to remove.
    */
    deleteSelectMenu(index: number = 0) {
        removeItemOnce(this.__selectMenuList, index)
    }
    /** 
    * Gets the select from the menu.
    * @author Liam Shackhorn
    * @param {number} index - The index of the select you would like to get.
    * @returns {SelectMenuBuilder}
    */
    getSelectMenu(index: number): SelectMenuBuilder {
        return this.__selectMenuList[index]
    }
    /** 
    * Renders the menu as parameters to \<Interaction\>.update()
    * @returns {InteractionUpdateOptions}
    */
    toMessageObject(): InteractionUpdateOptions {
        let msgBody = {
            content: this.__messageContent,
            embeds: this.__embedList,
            components: [] as any[]
        }
        if (this.__selectMenuList.length !== 0) {
            msgBody.components.push(new ActionRowBuilder<SelectMenuBuilder>().addComponents(...this.__selectMenuList))
        }
        if (this.__buttonList.length !== 0) {
            msgBody.components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(...this.__buttonList))
        }

        return msgBody
    }
}