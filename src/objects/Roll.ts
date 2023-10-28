import { Database } from 'src/database.types'
import { random } from '../helpers/functions';
export interface RollResult {
    NaturalRoll: number,
    FinalRoll: number
}
export class Roll {
    info:Database["public"]["Tables"]["rolls"]["Row"];
    private bonus:number=0;
    constructor(info:Database["public"]["Tables"]["rolls"]["Row"] ){
        this.info = info;
    }
    makeRolls(): RollResult[] {
        let rolls:RollResult[] = []
        for(let i = 0; i < this.info.dice_amt; i++){
            const result = random(1, this.info.dice_max);
            rolls.push({
                NaturalRoll: result,
                FinalRoll: result + this.bonus
            })
        }
        return rolls;
    }
    setBonus(bonus:number){
        this.bonus = bonus;
    }

}