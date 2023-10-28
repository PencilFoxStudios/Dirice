import { Database, Json } from 'src/database.types'
import { Roll, RollResult } from './Roll';
import { DiriceDBClient } from '../api/DiriceDBClient';
import { DiriceError } from '../helpers/DiriceError';
export interface RawCharacterStat {
    roll_id: number,
    roll_modifier: number,
}
export interface CharacterStat {
    roll: Roll,
    roll_modifier: number,
    roll_name: string,
}
const DiriceClient = new DiriceDBClient()
export class Character {
    info: Database["public"]["Tables"]["characters"]["Row"];
    constructor(info: Database["public"]["Tables"]["characters"]["Row"]) {
        this.info = info;
    }
    async getStats(): Promise<CharacterStat[]> {
        const stats: CharacterStat[] = [];
        for (const stat of ((this.info.stats as unknown[]) as RawCharacterStat[]).values()) {
            const Roll = (await DiriceClient.roll({ id: stat["roll_id"] }).get())[0];
            Roll.setBonus(stat["roll_modifier"]);
            stats.push({
                roll: Roll,
                roll_modifier: stat["roll_modifier"],
                roll_name: Roll.info.roll_name
            })
        }
        return stats;
    }
    async rollForStat(stat:Database["public"]["Tables"]["rolls"]["Row"]["roll_name"]):Promise<RollResult>{
        const characterStats = await this.getStats();
        const rollInQuestion = (characterStats).find((compStat:CharacterStat) => compStat.roll_name == stat);
        if(!rollInQuestion){
            throw new DiriceError("Roll not found for stat " + stat);
        }
        return rollInQuestion.roll.makeRolls()[0];
    }


}