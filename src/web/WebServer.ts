import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { Client } from "discord.js";
import fastify from 'fastify'
import { DiriceDBClient } from "src/api/DiriceDBClient";
import net from 'net'; 






export class WebServer {
    private Discord: Client;
    private TCPServer = net.createServer(); 
    private EraserTail:EraserTailClient;
    private Dirice:DiriceDBClient;

    private readonly server = fastify({logger: false});
    private readonly HOST: string = "127.0.0.1";
    private readonly PORT: number = 8080;
    constructor(client: Client, Dirice:DiriceDBClient, EraserTail:EraserTailClient) {
        this.Discord = client;
        this.Dirice = Dirice;
        this.EraserTail = EraserTail;
        this.init();
    }
    init(){
        const ET = this.EraserTail;
        this.server.get('*', function handler(request, reply) {
            ET.log("Debug", request.url??"Unknown URL was rung...")
            return "I AM ALIVE.";
        })
 
    
          
 
         
        

    }
    async start() {
        try {
            await this.server.listen({ port: this.PORT })
        } catch (err) {
            this.server.log.error(err)
        }
    }

}
