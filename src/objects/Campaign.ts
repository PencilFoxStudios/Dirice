import { DiriceDBClient } from '../api/DiriceDBClient';
import { Database } from '../database.types'
import { DiriceError } from '../errors/DiriceError';
import { Character } from './Character';
import { Roll } from './Roll';
export class Campaign {
    info:Database["public"]["Tables"]["campaigns"]["Row"];
    client:DiriceDBClient = new DiriceDBClient();
    private rolls:Roll[] | null = null;
    constructor(info:Database["public"]["Tables"]["campaigns"]["Row"] ){
        this.info = info;
    }
    async fetchRolls(){
        this.rolls = await this.client.roll({campaign_id: this.info.id}).get()
    }
    getRolls(){
        return this.rolls;
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
    getID(): Database["public"]["Tables"]["campaigns"]["Row"]["id"] {
        return this.info.id;
    }
    async syncStatsWithCharacters(){
        await this.client.campaigns(this.info).syncStatChangesToCharacters(this)
    }
}