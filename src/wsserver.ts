import http from "http";
import url from "url";
import WebSocket from "ws";
import logger from "./config/logger";
import RequestWithUser from "./interfaces/request.interface";

export class WebSocketRequest {

    private isAlive: boolean;
    private interval: NodeJS.Timeout;
    private ws: WebSocket;
    private request: RequestWithUser;

    constructor(ws: WebSocket, request: RequestWithUser) {
        this.isAlive = true;
        this.ws = ws;
        this.request = request;
        this.interval = setInterval(this.setIntervalCallback, 10000);
        this.initClient();
    }

    private initClient() {
        this.ws.on("pong", this.pong);
        this.ws.on("open", this.onOpen);
        this.ws.on("message", this.onMessage);
        this.ws.on("close", this.onClose);
        this.ws.send("Connecting to websocket");
    }

    private pong = () => {
        logger.info(`Recieved a pong:${new Date().toISOString()}`);
        this.isAlive = true;
    }

    private onOpen = () => {
        logger.info("Inside open connection");
        this.ws.send(Date.now());
    }

    private onMessage = (message: any) => {
        logger.info("Received a message in the websocket connection....");
        this.ws.send(`Received message ${message}`);
    }

    private onClose = () => {
        logger.info("Closing the websocket connection....");
        clearInterval(this.interval);
    }

    private setIntervalCallback = () => {
        if (this.isAlive === false) {
            this.ws.terminate();
            return;
        }
        this.isAlive = false;
        this.ws.ping(() => { return; });

    }
}

// tslint:disable-next-line: max-classes-per-file
export class WebSocketServer {

    public server: http.Server;
    public wss: WebSocket.Server;

    constructor(server: http.Server) {
        this.server = server;
        this.wss = new WebSocket.Server({ server });
        this.server.on("upgrade", this.upgrade);
        this.wss.on("connection", this.connection);
    }

    private upgrade = (request: RequestWithUser, socket: any, head: any) => {
        logger.info("Trying an upgrade");
        const pathname = url.parse(request.url).pathname;
        if (pathname !== "/tryout") {
            logger.info(`Destroying the socket due to invalid path ${pathname}`);
            socket.destroy();
            return;
        }
    }

    private connection = (ws: WebSocket, request: RequestWithUser) => {
        logger.info("Connected to websocket");
        const wReq = new WebSocketRequest(ws, request);
        logger.debug(`new web socket request created.`);
    }

}
