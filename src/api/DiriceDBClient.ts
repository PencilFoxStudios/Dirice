import { PostgrestSingleResponse, createClient } from '@supabase/supabase-js'
import { Database, Json } from 'src/database.types'
import { DiriceError } from 'src/helpers/DiriceError'
import { Campaign } from '../objects/Campaign'
import { Character } from '../objects/Character'
import { ChatInputCommandInteraction, User } from 'discord.js'
import { PostgrestResponseFailure, PostgrestResponseSuccess } from '@supabase/postgrest-js'
import { Status } from '../objects/Status'
import { Roll } from '../objects/Roll'

const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_TOKEN!)

const CAMPAIGNS = supabase.from("campaigns")
const CHARACTERS = supabase.from("characters")
const ROLLS = supabase.from("rolls")
const STATUSES = supabase.from("statuses")

type CAMPAIGNS_TABLE = Database["public"]["Tables"]["campaigns"];

type CHARACTERS_TABLE = Database["public"]["Tables"]["characters"];

type STATUS_TABLE = Database["public"]["Tables"]["statuses"];

type ROLL_TABLE = Database["public"]["Tables"]["rolls"];


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
        }
    }
    
}
