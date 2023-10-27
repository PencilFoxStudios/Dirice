import { PostgrestSingleResponse, createClient } from '@supabase/supabase-js'
import { Database, Json } from 'src/database.types'
import { DiriceError } from 'src/helpers/DiriceError'
import { Campaign } from '../objects/Campaign'
import { Character } from '../objects/Character'
import { User } from 'discord.js'
import { PostgrestResponseFailure, PostgrestResponseSuccess } from '@supabase/postgrest-js'

const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_TOKEN!)

const CAMPAIGNS = supabase.from("campaigns")
const CHARACTERS = supabase.from("characters")
const ROLLS = supabase.from("rolls")
const STATUSES = supabase.from("statuses")

type CAMPAIGNS_TABLE = Database["public"]["Tables"]["campaigns"];
type CAMPAIGN_ID = CAMPAIGNS_TABLE["Row"]["id"];

type CHARACTERS_TABLE = Database["public"]["Tables"]["characters"];
type CHARACTER_ID = CHARACTERS_TABLE["Row"]["id"];



export class DiriceDBClient {
    constructor(){}

    campaigns = function(params?:CAMPAIGNS_TABLE["Update"]){
        return {
            /**
             * Gets campaigns.
             */
            get: async function (){
                let CAMPAIGNS_SELECTION = CAMPAIGNS.select("*");
                for (const [key, value] of Object.entries(params as object)){
                    CAMPAIGNS_SELECTION = CAMPAIGNS_SELECTION.eq(key, value)
                }
                const { data, error } = (await CAMPAIGNS_SELECTION);
                if(!error){
                    return data.map((item) => new Campaign(item))
                }else{
                    throw new DiriceError(error.message)
                }
            },
        }
    }
    characters = function(characterID?:CHARACTER_ID){
        return {
            /**
             * Gets characters.
             */
            get: async function (){
                let CHARACTERS_SELECTION = CHARACTERS.select("*");
                if(characterID){
                    CHARACTERS_SELECTION = CHARACTERS_SELECTION.eq("id", characterID)
                }
                const { data, error } = (await CHARACTERS_SELECTION);
                if(!error){
                    return data.map((item) => new Character(item))
                }else{
                    throw new DiriceError(error.message)
                }
            },
        }
    }
    players = function(playerID:User["id"]){
        return {
            /**
             * Gets characters that the player owns.
             */
            getOwnedCharacters: async function (){
                const CHARACTERS_SELECTION = CHARACTERS.select("*").eq("owner_id", playerID);
                const { data, error } = (await CHARACTERS_SELECTION);
                if(!error){
                    return data.map((item) => new Character(item))
                }else{
                    throw new DiriceError(error.message)
                }
            },
            /**
             * Gets characters that the player can manage.
             */
            getManagedCharacters: async function (){
                const CHARACTERS_SELECTION = CHARACTERS.select("*").contains("can_manage", playerID);
                const { data, error } = (await CHARACTERS_SELECTION);
                if(!error){
                    return data.map((item) => new Character(item))
                }else{
                    throw new DiriceError(error.message)
                }
            },
            
        }
    }
}