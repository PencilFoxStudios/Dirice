import { DiriceDBClient } from '../api/DiriceDBClient';
import { Database } from '../database.types'
import { DiriceError } from '../errors/DiriceError';
import { Character } from './Character';
import { Roll } from './Roll';
export class Campaign {
    info:Database["public"]["Tables"]["campaigns"]["Row"];
    client:DiriceDBClient = new DiriceDBClient();
    private characters:Character[] | null = null;
    private rolls:Roll[] | null = null;
    constructor(info:Database["public"]["Tables"]["campaigns"]["Row"] ){
        this.info = info;
    }
    getDescription(){
        return this.info.description;
    }
    getPhotoURL(){
        return this.info.photo_url;
    }
    getCanManage(){
        return this.info.manager_ids;
    }

    async fetchRolls(){
        this.rolls = await this.client.roll({campaign_id: this.info.id}).get()
    }
    getRolls(){
        if(!this.rolls){
            throw new DiriceError("You must fetch this campaigns's rolls first!")
        }
        return this.rolls;
    }
    async fetchCharacters(){
        this.characters = await this.client.characters({campaign_id: this.info.id}).get()
    }
    getCharacters(){
        if(!this.characters){
            throw new DiriceError("You must fetch this campaigns's characters first!")
        }
        return this.characters;
    }
    async createRoll(name:string, diceAmount:number, numOfSides:number){
        await this.client.roll({
            campaign_id: this.info.id,
            dice_amt: diceAmount,
            dice_max: numOfSides,
            roll_name: name
        }).create();
        await this.fetchRolls();
        await this.syncStatsWithCharacters();
    }
    async deleteRoll(name:string){
        await this.fetchRolls();
        const RollToBeExecuted = this.rolls!.find((roll:Roll) => roll.getName() == name);
        if(!RollToBeExecuted){
            throw new DiriceError("Cannot delete Roll that doesn't exist!")
        }
        await RollToBeExecuted.delete()
        await this.syncStatsWithCharacters();
    }
    async delete(){
        await this.client.campaigns(this.info).delete();
    }
    getID(): Database["public"]["Tables"]["campaigns"]["Row"]["id"] {
        return this.info.id;
    }
    getName(): Database["public"]["Tables"]["campaigns"]["Row"]["name"] {
        return this.info.name;
    }
    async syncStatsWithCharacters(){
        await this.client.campaigns(this.info).syncStatChangesToCharacters(this)
    }
}