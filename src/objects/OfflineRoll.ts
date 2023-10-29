import { Database } from '../database.types'
import { random } from '../helpers/functions';
import { RollResult } from './Roll';

export class OfflineRoll {
    private amount:number;
    private min:number;
    private max:number;
    private bonus:number;
    constructor(amount:number=1, min:number=1, max:number=20, bonus:number=0){
        this.amount = amount;
        this.min = min;
        this.max = max;
        this.bonus = bonus;
    }
    makeRolls(): RollResult[] {
        let rolls:RollResult[] = []
        for(let i = 0; i < this.amount; i++){
            const result = random(1, this.max);
            rolls.push({
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

}