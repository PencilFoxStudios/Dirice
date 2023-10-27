import { createClient } from '@supabase/supabase-js'
import { Database } from 'src/database.types'
import { DiriceError } from 'src/helpers/DiriceError'

const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_TOKEN!)

const CAMPAIGNS = supabase.from("campaigns")
const CHARACTERS = supabase.from("characters")
const ROLLS = supabase.from("rolls")
const STATUSES = supabase.from("statuses")

type CAMPAIGNS_TABLE = Database["public"]["Tables"]["campaigns"];
type CAMPAIGN_ID = CAMPAIGNS_TABLE["Row"]["id"];


export class DiriceDBClient {
    constructor(){}

    campaigns = function(campaignID?:CAMPAIGN_ID){
        return {
            /**
             * Gets campaigns.
             */
            get: async function (){
                const CAMPAIGNS_SELECTION = CAMPAIGNS.select("*");
                if(campaignID){
                    return await CAMPAIGNS_SELECTION.eq("id", campaignID)
                }
                return await CAMPAIGNS_SELECTION
            },
            /**
             * Updates campaigns.
             */
            update: async function (params:CAMPAIGNS_TABLE["Update"]){
                if(campaignID){
                    const CAMPAIGNS_SELECTION = CAMPAIGNS.update(params).eq("id", campaignID)
                    return await CAMPAIGNS_SELECTION
                }else{
                    throw new DiriceError("Campaign ID required in order to update!")
                }
            },
        }
    }
}