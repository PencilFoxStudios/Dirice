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

    private readonly server = fastify(
        {  logger: {
            serializers: {
              req: function (req) {
                return { url: req.url }
              }
            }
          }}
    );
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
        this.server.get('/', function handler(request, reply) {
            ET.log("Debug", "/ was rung!")
            return "Yeah good."
        })
        this.server.get('/dev', function handler(request, reply) {
            ET.log("Debug", "/dev was rung!")
            return "Yeah goodie."
        })

        this.server.get('/health', async function handler(request, reply) {
            return "I'm feeling pretty good!"
        })
         
        this.TCPServer.listen(this.PORT, this.HOST, () => { 
            this.EraserTail.log("Debug", `TCP Client listening on ${this.HOST}:${this.PORT}`); 
        }); 
        this.TCPServer.on('connection', (socket) => { 
            var clientAddress = `${socket.remoteAddress}:${socket.remotePort}`; 
            this.EraserTail.log("Debug", `New client connected: ${clientAddress}`);
        }); 
        

    }
    async start() {
        try {
            await this.server.listen({ port: this.PORT })
        } catch (err) {
            this.server.log.error(err)
        }
    }

}
