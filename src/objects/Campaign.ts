import { Database } from 'src/database.types'
export class Campaign {
    info:Database["public"]["Tables"]["campaigns"]["Row"];
    constructor(info:Database["public"]["Tables"]["campaigns"]["Row"] ){
        this.info = info;
    }
}