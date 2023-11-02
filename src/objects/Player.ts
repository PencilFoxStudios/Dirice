import { Database } from '../database.types'
import { Character } from './Character';
import { DiriceDBClient, PLAYERS_TABLE, supabase } from '../api/DiriceDBClient';
import { DiriceError } from '../errors/DiriceError';

import { CampaignAlreadyExistsError, CampaignFailedToCreateError, CampaignNotFoundError, CharacterAlreadyExistsError, CharacterNotFoundError, PlayerNoPermissionsError } from '../errors/Errors';
import { Campaign } from './Campaign';
import { Roll } from './Roll';
export class Player {
    info:Database["public"]["Tables"]["players"]["Row"];
    client:DiriceDBClient;
    constructor(info:Database["public"]["Tables"]["players"]["Row"] ){
        this.info = info;
        this.client = new DiriceDBClient(this.info.user_id.toString())
    }
    getID(): Database["public"]["Tables"]["players"]["Row"]["user_id"] {
        return this.info.user_id;
    }
    getSettings(): Database["public"]["Tables"]["players"]["Row"]{
        return this.info;
    }
    async createCampaign(campDetails:Database["public"]["Tables"]["campaigns"]["Insert"]): Promise<Campaign>{
        const OldCampaigns = await this.client.campaigns(campDetails).get();
        if(OldCampaigns.length > 0){
            throw new CampaignAlreadyExistsError(OldCampaigns[0]);
        }
        await this.client.campaigns(campDetails).create()
        const NewCampaign = await this.client.campaigns(campDetails).get();
        if(NewCampaign.length == 0){
            throw new CampaignFailedToCreateError();
        }

        return NewCampaign[0];


    }
    async createCharacter(charDetails:Database["public"]["Tables"]["characters"]["Insert"]): Promise<Character>{
        const OldCharacters = await this.client.characters(charDetails).get();
        if(OldCharacters.length > 0){
            throw new CharacterAlreadyExistsError(OldCharacters[0]);
        }
        await this.client.characters(charDetails).create()
        const NewCharacter = await this.client.characters(charDetails).get();
        if(NewCharacter.length == 0){
            throw new CharacterNotFoundError();
        }

        return NewCharacter[0];
    }

    async getRollableCharacters () {
        let CHARACTERS_SELECTION = supabase.from("characters").select("*").or(`can_roll_as.cs.{"${this.info.user_id}"},can_manage.cs.{"${this.info.user_id}"},owner_id.eq.${this.info.user_id}`)
        const { data, error } = (await CHARACTERS_SELECTION);
        if(!error){
            return data.map((item) => new Character(item))
        }else{
            throw new DiriceError(error.message)
        }
    }
    async getManageableCharacters () {
        let CHARACTERS_SELECTION = supabase.from("characters").select("*").or(`can_manage.cs.{"${this.info.user_id}"},owner_id.eq.${this.info.user_id}`)
        const { data, error } = (await CHARACTERS_SELECTION);
        if(!error){
            return data.map((item) => new Character(item))
        }else{
            throw new DiriceError(error.message)
        }
    }
    async getManageableCampaigns () {
        let CAMPAIGNS_SELECTION = supabase.from("campaigns").select("*").or(`manager_ids.cs.{"${this.info.user_id}"},dm_id.eq.${this.info.user_id}`)
        const { data, error } = (await CAMPAIGNS_SELECTION);
        if(!error){
            return data.map((item) => new Campaign(item))
        }else{
            throw new DiriceError(error.message)
        }
    }
    async getManageableRolls () {
        const manageableCampaigns = await this.getManageableCampaigns()
        const manageableCharacters = await this.getManageableCharacters()
        let ROLLS_SELECTION = supabase.from("rolls").select("*").or(`campaign_id.in.${manageableCampaigns.map((campaign:Campaign) => campaign.getID())}`).or(`character_id.in.${manageableCharacters.map((character:Character) => character.getID())}`)
        const { data, error } = (await ROLLS_SELECTION);
        if(!error){
            return data.map((item) => new Roll(item))
        }else{
            throw new DiriceError(error.message)
        }
    }
    async updateSettings (settings:PLAYERS_TABLE["Update"]) {
        let SETTINGS_UPDATE = supabase.from("players").update(settings).eq("user_id", this.info.user_id)
        const { data, error } = (await SETTINGS_UPDATE);
        if(error){
            throw new DiriceError(error.message) 
        }
    }
    async kickCharacterFromCampaign(campaign:Campaign, character:Character){
        const manageableCampaigns = await this.getManageableCampaigns()
        if(!manageableCampaigns.includes(campaign)){
            throw new PlayerNoPermissionsError("KICK_CHARACTER_FROM_CAMPAIGN")
        }else{
            await character.joinCampaign(null);
        }
    }
}