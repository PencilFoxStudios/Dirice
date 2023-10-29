import { Character } from "../objects/Character";
import { DiriceError } from "./DiriceError";

export class CharacterNoStatError extends DiriceError{
    constructor(char:Character, stat:string){
        super(`The character ${char.getName()} does not have the ${stat} stat!`)
    }
}