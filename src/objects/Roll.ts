import { DiriceDBClient } from '../api/DiriceDBClient';
import { Database } from '../database.types'
import { random } from '../helpers/functions';
export interface RollResult {
    NaturalMaximumPossible: number,
    NaturalRoll: number,
    Modifier: number,
    FinalRoll: number
}
export class Roll {
    info:Database["public"]["Tables"]["rolls"]["Row"];
    client:DiriceDBClient = new DiriceDBClient();
    private bonus:number=0;
    constructor(info:Database["public"]["Tables"]["rolls"]["Row"] ){
        this.info = info;
    }
    async delete(){
        await this.client.roll(this.info).delete();
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