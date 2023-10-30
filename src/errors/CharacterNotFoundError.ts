import { Character } from "../objects/Character";
import { DiriceError } from "./DiriceError";

export class CharacterNotFoundError extends DiriceError{
    constructor(){
        super(`The character does not appear to exist!`)
    }
}