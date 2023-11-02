import { Campaign } from "../objects/Campaign";
import { Character } from "../objects/Character";
import { DiriceError } from "./DiriceError";

export class CharacterAlreadyExistsError extends DiriceError{
    constructor(char:Character){
        super(`The character ${char.getName()} appears to already exist...`)
    }
}
export class CharacterNotFoundError extends DiriceError{
    constructor(){
        super(`The character does not appear to exist!`)
    }
}
export class CharacterNoStatError extends DiriceError{
    constructor(char:Character, stat:string){
        super(`The character ${char.getName()} does not have the ${stat} stat!`)
    }
}
export class CampaignNotFoundError extends DiriceError{
    constructor(campName:string){
        super(`The campaign ${campName} does not appear to exist!`)
    }
}
export class CampaignFailedToCreateError extends DiriceError{
    constructor(){
        super(`The campaign failed to be created!`)
    }
}
export class CampaignAlreadyExistsError extends DiriceError{
    constructor(camp:Campaign){
        super(`The campaign ${camp.getName()} appears to already exist...`)
    }
}
export class RollNotFoundError extends DiriceError{
    constructor(){
        super(`The roll does not appear to exist!`)
    }
}
export class RollAlreadyExistsError extends DiriceError{
    constructor(){
        super(`The roll appears to already exist!`)
    }
}
export class RollNoStatError extends DiriceError{
    constructor(roll:string){
        super(`The roll ${roll} does not have a stat!`)
    }
}
export class RollNoCharacterError extends DiriceError{
    constructor(roll:string){
        super(`The roll ${roll} does not have a character!`)
    }
}
export class RollNoCampaignError extends DiriceError{
    constructor(roll:string){
        super(`The roll ${roll} does not have a campaign!`)
    }
}
export class RollNoRollsError extends DiriceError{
    constructor(roll:string){
        super(`The roll ${roll} does not have any rolls!`)
    }
}

export class UserNotFoundError extends DiriceError{
    constructor(){
        super(`The user does not appear to exist!`)
    }
}
export class UserAlreadyExistsError extends DiriceError{
    constructor(){
        super(`The user appears to already exist!`)
    }
}
export class UserNoPlayerError extends DiriceError{
    constructor(){
        super(`The user does not have a player!`)
    }
}
export class UserNoCampaignError extends DiriceError{
    constructor(){
        super(`The user does not have a campaign!`)
    }
}
export class UserNoCharacterError extends DiriceError{
    constructor(){
        super(`The user does not have a character!`)
    }
}
export class UserNoRollError extends DiriceError{
    constructor(){
        super(`The user does not have a roll!`)
    }
}
export class UserNoStatsError extends DiriceError{
    constructor(){
        super(`The user does not have any stats!`)
    }
}
export class StorageBucketRejectError extends DiriceError{
    constructor(msg:string){
        super(`The storage bucket rejected your request.\n${msg}`)
    }
}
export class CampaignNotOpenError extends DiriceError{
    constructor(){
        super(`The campaign is not open for new joins!`)
    }
}
export class PlayerNoPermissionsError extends DiriceError{
    constructor(perm:string){
        super(`You do not have permissions to ${perm}!`)
    }
}
