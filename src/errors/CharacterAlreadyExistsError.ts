import { Character } from "../objects/Character";
import { DiriceError } from "./DiriceError";

export class CharacterAlreadyExistsError extends DiriceError{
    constructor(char:Character){
        super(`The character ${char.getName()} appears to already exist...`)
    }
}