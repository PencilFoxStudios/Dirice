import { Database, Json } from '../database.types'
import { Roll, RollResult } from './Roll';
import {DiriceDBClient} from '../api/DiriceDBClient';
import { DiriceError } from '../errors/DiriceError';
import { OfflineRoll } from './OfflineRoll';

import { Campaign } from './Campaign';
import { CampaignNotOpenError, CharacterNoStatError } from '../errors/Errors';
export interface RawCharacterStat {
    roll_id: number,
    roll_modifier: number,
}
export interface CharacterStat {
    roll: Roll,
    roll_modifier: number,
    roll_name: string,
}

export class Character {
    info: Database["public"]["Tables"]["characters"]["Row"];
    client:DiriceDBClient = new DiriceDBClient();
    private stats?:CharacterStat[];
    private linkedCampaign:Campaign|null|undefined;
    constructor(info: Database["public"]["Tables"]["characters"]["Row"]) {
        this.info = info;
    }
    getID(): Database["public"]["Tables"]["characters"]["Row"]["id"] {
        return this.info.id;
    }
    getName(): Database["public"]["Tables"]["characters"]["Row"]["name"] {
        return this.info.name;
    }
    getDescription(): Database["public"]["Tables"]["characters"]["Row"]["description"] {
        return this.info.description;
    }
    getPhotoURL(): Database["public"]["Tables"]["characters"]["Row"]["photo_url"] {
        return this.info.photo_url;
    }
    getCanRollAs(): Database["public"]["Tables"]["characters"]["Row"]["can_roll_as"] {
        return this.info.can_roll_as;
    }
    getQuote(): Database["public"]["Tables"]["characters"]["Row"]["quote"] {
        return this.info.quote;
    }
    getCanManage(): Database["public"]["Tables"]["characters"]["Row"]["can_manage"] {
        return this.info.can_manage;
    }
    getCampaign(): Campaign|null {
        if(this.linkedCampaign == undefined){
            throw new DiriceError("You must fetch this character's linked campaign first!")
        }
        return this.linkedCampaign;
    }
    getOwnerID(): string {
        return this.info.owner_id;
    }
    async createRoll(name:string, diceAmount:number=1, numOfSides:number=20){
        await this.client.roll({
            character_id: this.info.id,
            dice_amt: diceAmount,
            dice_max: numOfSides,
            roll_name: name
        }).create();
    }
    async fetch(): Promise<void> {
        this.info = (await this.client.characters({id: this.info.id }).get())[0].info;
    }
    async fetchCampaign(): Promise<Character> {
        await this.fetch();
        if(this.info.campaign_id == null){
            this.linkedCampaign = null;
        }else{
            const Camps:Campaign[] = await this.client.campaigns({ id: this.info.campaign_id }).get();
            if(Camps.length !== 1){
                throw new DiriceError("Fetch character's campaign returned multiple or none!")
            }
            this.linkedCampaign = Camps[0];
        }
        return this;
        
    }
    async joinCampaign(campaign:Campaign|null): Promise<Character> {
        await this.fetch();
        if(campaign){
            if(campaign.isOpen() || campaign.getCanManage().includes(this.getOwnerID())){
                await this.client.characters({ id: this.info.id, campaign_id: campaign.getID() }).update();
                this.linkedCampaign = campaign;
            }else{
                throw new CampaignNotOpenError()
            }

        }else{
            await this.client.characters({ id: this.info.id, campaign_id: null }).update();
            this.linkedCampaign = null;
        }
       
        
        return this;
    }
    async delete(){
        await this.client.characters(this.info).delete();
    }
    async removeStat(stat:Roll): Promise<Character> {
        await this.fetchStats();
        const statsUpdated:RawCharacterStat[] = [];
        for(const statToCheck of this.stats!){
            if(statToCheck.roll.getID() !== stat.getID()){
                statsUpdated.push(
                    {
                        roll_id: statToCheck.roll.getID(),
                        roll_modifier: statToCheck.roll_modifier
                    }
                
                );
            }
        }
        await this.client.characters({ id: this.info.id, stats:statsUpdated as any }).update();
        return this;
    }
    async updateStats(statsToUpdate:RawCharacterStat[]): Promise<Character> {
        await this.fetchStats();
        let statsUpdated:RawCharacterStat[] = [];
        for(const stat of this.stats!){
            const statToUpdate = statsToUpdate.find((compStat:RawCharacterStat) => compStat.roll_id == stat.roll.getID());
            if(statToUpdate){

                statsUpdated.push(
                    {
                        roll_id: stat.roll.getID(),
                        roll_modifier: statToUpdate.roll_modifier
                    }
                
                );
            }else{
                statsUpdated.push(
                    {
                        roll_id: stat.roll.getID(),
                        roll_modifier: stat.roll_modifier
                    }
                
                );
            
            }
        }
        await this.client.characters({ id: this.info.id, stats:statsUpdated as any }).update();
        return this;
    }
    async fetchStats(): Promise<Character> {
        await this.fetch();
        const stats: CharacterStat[] = [];
        const validStats: RawCharacterStat[] = [];
        for (const stat of ((this.info.stats as unknown[]) as RawCharacterStat[]).values()) {
            let R = (await this.client.roll({ id: stat["roll_id"] }).get())[0];
            if(!R){
               continue;
            }
            R.setBonus(stat["roll_modifier"]);
            validStats.push({
                roll_id: stat["roll_id"],
                roll_modifier: stat["roll_modifier"],
            })
            stats.push({
                roll: R,
                roll_modifier: stat["roll_modifier"],
                roll_name: R.info.roll_name
            })
        }
        this.stats = stats;
        await this.client.characters({ id: this.info.id, stats: validStats as any  }).update();
        return this;
    }
    getStats(): CharacterStat[] {
        if(!this.stats){
            throw new DiriceError("You must fetch this character's stats first!")
        }
        return this.stats;
    }
    roll(amount:number=1, max:number=20, bonus:number=0): RollResult[] {
        const RollInQuestion = new OfflineRoll(amount, max, bonus);
        return RollInQuestion.makeRolls();
    }
    rollForStat(stat:Database["public"]["Tables"]["rolls"]["Row"]["roll_name"], amount?:number, max?:number, bonus?:number):RollResult[]{
        if(!this.stats){
            throw new DiriceError("You must fetch this character's stats first!")
        }
        const characterStats = this.stats;
        const rollInQuestion = (characterStats).find((compStat:CharacterStat) => compStat.roll_name == stat);
        if(!rollInQuestion){
            throw new CharacterNoStatError(this, stat);
        }
        const Roll = rollInQuestion.roll;
        if(bonus) Roll.setBonus(bonus);
        if(amount) Roll.setDiceAmount(amount);
        if(max) Roll.setDiceMax(max);

        return Roll.makeRolls();
    }


}