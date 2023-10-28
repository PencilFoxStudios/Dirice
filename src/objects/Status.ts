import { Database } from 'src/database.types'
export class Status {
    info:Database["public"]["Tables"]["statuses"]["Row"];
    constructor(info:Database["public"]["Tables"]["statuses"]["Row"] ){
        this.info = info;
    }
}