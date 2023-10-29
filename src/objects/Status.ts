import { Database } from '../database.types'
export class Status {
    info:Database["public"]["Tables"]["statuses"]["Row"];
    constructor(info:Database["public"]["Tables"]["statuses"]["Row"] ){
        this.info = info;
    }
    getID(): Database["public"]["Tables"]["statuses"]["Row"]["id"] {
        return this.info.id;
    }
}