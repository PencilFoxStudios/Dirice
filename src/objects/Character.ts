import { Database } from 'src/database.types'
export class Character {
    info:Database["public"]["Tables"]["characters"]["Row"];
    constructor(info:Database["public"]["Tables"]["characters"]["Row"] ){
        this.info = info;
    }
}