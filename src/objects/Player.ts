import { Database } from '../database.types'
import { Character } from './Character';
import { DiriceDBClient, PLAYERS_TABLE, supabase } from '../api/DiriceDBClient';
import { DiriceError } from '../errors/DiriceError';
import { CharacterNotFoundError } from '../errors/CharacterNotFoundError';
import { CharacterAlreadyExistsError } from '../errors/CharacterAlreadyExistsError';
export class Player {
    info:Database["public"]["Tables"]["players"]["Row"];
    client:DiriceDBClient;
    constructor(info:Database["public"]["Tables"]["players"]["Row"] ){
        this.info = info;
        this.client = new DiriceDBClient(this.info.user_id.toString())
    }
    getID(): Database["public"]["Tables"]["players"]["Row"]["user_id"] {
        return this.info.user_id;
    }
    getSettings(): Database["public"]["Tables"]["players"]["Row"]{
        return this.info;
    }
    async createCharacter(charDetails:Database["public"]["Tables"]["characters"]["Insert"]): Promise<Character>{
        const OldCharacters = await this.client.characters(charDetails).get();
        if(OldCharacters.length > 0){
            throw new CharacterAlreadyExistsError(OldCharacters[0]);
        }
        await this.client.characters(charDetails).create()
        const NewCharacter = await this.client.characters(charDetails).get();
        if(NewCharacter.length == 0){
            throw new CharacterNotFoundError();
        }

        return NewCharacter[0];
    }

    async getRollableCharacters () {
        let CHARACTERS_SELECTION = supabase.from("characters").select("*").or(`can_roll_as.cs.{"${this.info.user_id}"},can_manage.cs.{"${this.info.user_id}"},owner_id.eq.${this.info.user_id}`)
        const { data, error } = (await CHARACTERS_SELECTION);
        if(!error){
            return data.map((item) => new Character(item))
        }else{
            throw new DiriceError(error.message)
        }
    }
    async getManageableCharacters () {
        let CHARACTERS_SELECTION = supabase.from("characters").select("*").or(`can_manage.cs.{"${this.info.user_id}"},owner_id.eq.${this.info.user_id}`)
        const { data, error } = (await CHARACTERS_SELECTION);
        if(!error){
            return data.map((item) => new Character(item))
        }else{
            throw new DiriceError(error.message)
        }
    }
    async updateSettings (settings:PLAYERS_TABLE["Update"]) {
        let SETTINGS_UPDATE = supabase.from("players").update(settings).eq("user_id", this.info.user_id)
        const { data, error } = (await SETTINGS_UPDATE);
        if(error){
            throw new DiriceError(error.message) 
        }
    }
}