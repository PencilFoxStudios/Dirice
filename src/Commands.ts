import { PNFXCommand } from "./Command";
import { Campaigns } from "./commands/campaigns";
import { Characters } from "./commands/characters";
// Import Commands
import { Mod } from "./commands/mod";
import { Openmodel } from "./commands/openmodel";
import { Ping } from "./commands/ping";
import { Dice } from "./commands/dice";
import { Rolls } from "./commands/rolls";

const Commands: PNFXCommand[] = []; 

/** 
 * Initializes all commands here. 
 * Change the boolean in the if statement to "enable" or "disable" them.
 * */ 

            if(true){ 
                Commands.push(new Ping())
            }

            if(true){ 
                Commands.push(new Characters())
            }

            if(true){ 
                Commands.push(new Dice())
            }

            if(true){
                Commands.push(new Campaigns())
            }

            if(true){
                Commands.push(new Rolls())
            }


export {Commands};