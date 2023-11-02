import { DiriceError } from 'src/errors/DiriceError';
import { DiriceDBClient } from '../api/DiriceDBClient';
import { Database } from '../database.types'
import { random } from '../helpers/functions';
import { Campaign } from './Campaign';
import { Character } from './Character';
import { CampaignNotFoundError, CharacterNotFoundError } from 'src/errors/Errors';
export interface RollResult {
    NaturalMaximumPossible: number,
    NaturalRoll: number,
    Modifier: number,
    FinalRoll: number
}
export class Roll {


    info:Database["public"]["Tables"]["rolls"]["Row"];
    client:DiriceDBClient = new DiriceDBClient();
    private owner:Character|Campaign|undefined;
    private bonus:number=0;
    constructor(info:Database["public"]["Tables"]["rolls"]["Row"] ){
        this.info = info;
    }

    getModifier() {
        return this.bonus;
    }
    getDiceSides() {
        return this.info.dice_max;
    }
    getDiceAmount() {
        return this.info.dice_amt;
    }
    async linkToCampaign(campaign: Campaign) {
        await this.client.roll({campaign_id: campaign.getID(), character_id: null}).update()
    }
    async linkToCharacter(character: Character) {
        await this.client.roll({campaign_id: null, character_id: character.getID()}).update()
    }
    async delete(){
        await this.client.roll(this.info).delete();
    }
    async fetch(){
        this.info = (await this.client.roll({id: this.info.id}).get())[0].info;
    }
    async fetchOwner(){
        await this.fetch();
        if(this.info.campaign_id){
            const campaignOwner = await this.client.campaigns({id: this.info.campaign_id}).get();
            if(campaignOwner.length == 1){
                this.owner = new Campaign(campaignOwner[0].info);
            }else {
                throw new CampaignNotFoundError(`[${this.info.campaign_id}]`)
            }
        }else if(this.info.character_id){
            const characterOwner = await this.client.characters({id: this.info.character_id}).get();
            if(characterOwner.length == 1){
                this.owner = new Character(characterOwner[0].info);
            }else {
                throw new CharacterNotFoundError()
            }
            
        }


    }
    getOwner(): Character|Campaign{
        if(this.owner == undefined){
            throw new DiriceError("You must fetch this roll's owner first!")
        }
        return this.owner;
    }
    getID(): Database["public"]["Tables"]["rolls"]["Row"]["id"] {
        return this.info.id;
    }
    getName(): Database["public"]["Tables"]["rolls"]["Row"]["roll_name"] {
        return this.info.roll_name;
    }
    makeRolls(): RollResult[] {
        let rolls:RollResult[] = []
        for(let i = 0; i < this.info.dice_amt; i++){
            const result = random(1, this.info.dice_max);
            rolls.push({
                NaturalMaximumPossible: this.info.dice_max,
                NaturalRoll: result,
                Modifier: this.bonus,
                FinalRoll: result + this.bonus
            })
        }
        return rolls;
    }
    setBonus(bonus:number){
        this.bonus = bonus;
    }
    setDiceAmount(diceAmount:number){
        this.info.dice_amt = diceAmount;
    }
    setDiceMax(diceMax:number){
        this.info.dice_max = diceMax;
    }

}