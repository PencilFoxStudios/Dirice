import { PNFXCommand } from "./Command";
// Import Commands
import { Mod } from "./commands/mod";
import { Openmodel } from "./commands/openmodel";
import { Ping } from "./commands/ping";

const Commands: PNFXCommand[] = []; 

/** 
 * Initializes all commands here. 
 * Change the boolean in the if statement to "enable" or "disable" them.
 * */ 

            if(true){ 
                Commands.push(new Ping())
            }

            if(true){ 
                Commands.push(new Openmodel())
            }

            if(true){ 
                Commands.push(new Mod())
            }


export {Commands};