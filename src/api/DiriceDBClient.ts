import { PostgrestSingleResponse, createClient } from '@supabase/supabase-js'
import { Database, Json } from '../database.types'
import { DiriceError } from '../errors/DiriceError'
import { Campaign } from '../objects/Campaign'
import { Character, CharacterStat, RawCharacterStat } from '../objects/Character'
import { ChatInputCommandInteraction, User } from 'discord.js'
import { PostgrestResponseFailure, PostgrestResponseSuccess } from '@supabase/postgrest-js'
import { Status } from '../objects/Status'
import { Roll } from '../objects/Roll'
import { Player } from '../objects/Player'
import { EraserTailClient } from '@pencilfoxstudios/erasertail'
import { removeElementFromArray } from '../helpers/functions'

const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_TOKEN!)

export const CAMPAIGNS = supabase.from("campaigns")
export const CHARACTERS = supabase.from("characters")
export const ROLLS = supabase.from("rolls")
export const STATUSES = supabase.from("statuses")
export const PLAYERS = supabase.from("players")



export type CAMPAIGNS_TABLE = Database["public"]["Tables"]["campaigns"];
export type CHARACTERS_TABLE = Database["public"]["Tables"]["characters"];
export type STATUS_TABLE = Database["public"]["Tables"]["statuses"];
export type ROLL_TABLE = Database["public"]["Tables"]["rolls"];
export type PLAYERS_TABLE = Database["public"]["Tables"]["players"]

export class DiriceDBClient {
    private DiscordID?:string;
    constructor(DiscordID?:string){
        this.DiscordID = DiscordID;
    }

    authorize = (DiscordID:string) => {
        this.DiscordID = DiscordID;
    }

    me = async () =>{
        if(!this.DiscordID){
            throw new DiriceError("You must authorize with a valid Discord ID before using me()!")
        }
        console.log(this.DiscordID)
        let SETTINGS = PLAYERS.select("*").eq("user_id", this.DiscordID)
        const { data, error } = (await SETTINGS);
        if(!error){
            if(data.length == 0){
                const newPlayer = {
                    selected_character: null,
                    user_id: this.DiscordID
                };
                await PLAYERS.insert(newPlayer)
                return new Player(newPlayer)
            }
            return new Player(data[0])
        }else{
            throw new DiriceError(error.message)
        }
    }

    campaigns = function(params?:CAMPAIGNS_TABLE["Update"]){
        return {
            /**
             * Gets campaigns.
             */
            get: async function (){
                let CAMPAIGNS_SELECTION = CAMPAIGNS.select("*");
                for (const [key, value] of Object.entries(params as object)){
                    if(!value){
                        continue;
                    }
                    CAMPAIGNS_SELECTION = CAMPAIGNS_SELECTION.eq(key, value)
                }
                const { data, error } = (await CAMPAIGNS_SELECTION);
                if(!error){
                    return data.map((item) => new Campaign(item))
                }else{
                    throw new DiriceError(error.message)
                }
            },
            /**
             * Syncs a campaign's stats with a character's stats, if they do not already have that stat present in their "stats" JSON.
             */
            syncStatChangesToCharacters: async function (camp:Campaign){
                if (!params) {
                    throw new DiriceError("Must specify parameters to sync!");
                  }
                  if (!params.id) {
                    throw new DiriceError("ID of the campaign must be provided when syncing!");
                  }
                  params = params as CAMPAIGNS_TABLE["Update"];
                  const campaignInQuestion = camp;
                
                  let STATS_MASS_LOOKUP = ROLLS.select("*").eq("campaign_id", campaignInQuestion.getID());
                
                  const statsLookup = (await STATS_MASS_LOOKUP);
                  if (statsLookup.error) {
                    throw new DiriceError(statsLookup.error.message);
                  }
                  const statsLookupData = statsLookup.data;
                  console.log("statsLookupData", statsLookupData)
                  let CHARACTERS_MASS_LOOKUP = CHARACTERS.select("*").eq("campaign_id", campaignInQuestion.getID());
                
                  const charactersLookup = (await CHARACTERS_MASS_LOOKUP);
                  if (charactersLookup.error) {
                    throw new DiriceError(charactersLookup.error.message);
                  }
                  const charactersLookupData = charactersLookup.data;
                  console.log("charactersLookupData", charactersLookupData)
                  for (const character of charactersLookupData) {
                    const characterOldStats: Json[] = character.stats as Json[];
                    const newStats = [];
                
                    for (const newStat of statsLookupData) {
                      if (!characterOldStats.find((stat: any) => stat.roll_id === newStat.id)) {
                        // Append new stats to the existing stats array
                        newStats.push({
                          roll_id: newStat.id,
                          roll_modifier: 0,
                        });
                      }
                    }
                    // console.log("[...characterOldStats, ...newStats]", [...characterOldStats, ...newStats])
                    // Update the character's stats with the new stats
                    const SPECIFIC_CHARACTER_UPDATE = CHARACTERS.update({
                      stats: [...characterOldStats, ...newStats],
                    }).eq('id', character.id);
                
                    const characterUpdate = (await SPECIFIC_CHARACTER_UPDATE);
                
                    if (characterUpdate.error) {
                      throw new DiriceError(characterUpdate.error.message);
                    }
                  }
            },

            /**
             * Updates campaigns.
             */
            update: async function (){
                params = params as CAMPAIGNS_TABLE["Update"]
                if(!params.id){
                    throw new DiriceError("ID of campaign must be provided when updating!")
                }
                let CAMPAIGN_UPDATE = CAMPAIGNS.update(params).eq("id", params.id);
                const { data, error } = (await CAMPAIGN_UPDATE);
                if(error){
                    throw new DiriceError(error.message)
                }
            },
        }
    }
    characters = function(params?:CHARACTERS_TABLE["Update"]){
        return {
            /**
             * Gets characters.
             */
            get: async function (){
                let CHARACTERS_SELECTION = CHARACTERS.select("*");
                for (const [key, value] of Object.entries(params as object)){
                    if(!value){
                        continue;
                    }
                    CHARACTERS_SELECTION = CHARACTERS_SELECTION.eq(key, value)
                }
                const { data, error } = (await CHARACTERS_SELECTION);
                if(!error){
                    return data.map((item) => new Character(item))
                }else{
                    throw new DiriceError(error.message)
                }
            },
            /**
             * Creates characters.
             */
            create: async function (){
                if(!params){
                    throw new DiriceError("Must specify parameters to create character!")
                }
                let CHARACTER_CREATION = CHARACTERS.insert(params as CHARACTERS_TABLE["Insert"]);
                const { data, error } = (await CHARACTER_CREATION);
                if(error){
                    throw new DiriceError(error.message)
                }
            },
        }
    }
    status = function(params?:STATUS_TABLE["Update"]){
        return {
            /**
             * Gets statuses.
             */
            get: async function (){
                let STATUSES_SELECTION = STATUSES.select("*");
                for (const [key, value] of Object.entries(params as object)){
                    if(!value){
                        continue;
                    }
                    STATUSES_SELECTION = STATUSES_SELECTION.eq(key, value)
                }
                const { data, error } = (await STATUSES_SELECTION);
                if(!error){
                    return data.map((item) => new Status(item))
                }else{
                    throw new DiriceError(error.message)
                }
            },
        }
    }
    roll = function(params?:ROLL_TABLE["Update"]){
        return {
            /**
             * Gets rolls.
             */
            get: async function (){
                let ROLLS_SELECTION = ROLLS.select("*");
                for (const [key, value] of Object.entries(params as object)){
                    if(!value){
                        continue;
                    }
                    ROLLS_SELECTION = ROLLS_SELECTION.eq(key, value)
                }
                const { data, error } = (await ROLLS_SELECTION);
                if(!error){
                    return data.map((item) => new Roll(item))
                }else{
                    throw new DiriceError(error.message)
                }
            },
            /**
             * Creates rolls.
             */
            create: async function (){
                if(!params){
                    throw new DiriceError("Must specify parameters to create roll!")
                }
                let ROLL_CREATION = ROLLS.insert(params as ROLL_TABLE["Insert"]);
                const { data, error } = (await ROLL_CREATION);
                if(error){
                    throw new DiriceError(error.message)
                }
            },
            /**
             * Deletes rolls.
             */
            delete: async function (){
                if(!params){
                    throw new DiriceError("Must specify parameters to delete roll!")
                }
                if(!params.id){
                    throw new DiriceError("Must specify id of roll to delete!")
                }
                let ROLL_DELETION = ROLLS.delete().eq("id", params.id)
                const { data, error } = (await ROLL_DELETION);
                if(error){
                    throw new DiriceError(error.message)
                }
            },
        }
    }
    player = function(params?:PLAYERS_TABLE["Update"]){
        return {
            /**
             * Gets players.
             */
            get: async function (){
                let PLAYERS_SELECTION = PLAYERS.select("*");
                for (const [key, value] of Object.entries(params as object)){
                    if(!value){
                        continue;
                    }
                    PLAYERS_SELECTION = PLAYERS_SELECTION.eq(key, value)
                }
                const { data, error } = (await PLAYERS_SELECTION);
                if(!error){
                    return data.map((item) => new Player(item))
                }else{
                    throw new DiriceError(error.message)
                }
            },
        }
    }
    
}
