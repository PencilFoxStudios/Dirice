import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { Client } from "discord.js";
import fastify from 'fastify'
import { DiriceDBClient } from "src/api/DiriceDBClient";

export class WebServer {
    private Discord: Client;
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

    private readonly PORT: number = 8080;
    constructor(client: Client, Dirice:DiriceDBClient, EraserTail:EraserTailClient) {
        this.Discord = client;
        this.Dirice = Dirice;
        this.EraserTail = EraserTail;
        this.init();
    }
    init(){
        const ET = this.EraserTail;
        this.server.get('/health', function handler(request, reply) {
            ET.log("Debug", "/health was rung!")
            return "I'm feeling pretty good!"
        })
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

    }
    async start() {
        try {
            await this.server.listen({ port: this.PORT })
        } catch (err) {
            this.server.log.error(err)
        }
    }

}