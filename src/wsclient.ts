import WebSocket from "ws";
import * as http from "http";
import logger from "./config/logger";

function heartbeat() {
    logger.info(`Recieved a ping:${new Date().toISOString()}`);
    clearTimeout(this.pingTimeout);
    this.pingTimeout = setTimeout(() => {
        logger.info("terminating ws connection");
        this.terminate();
    }, 10000 + 1000);
}

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkaXNwbGF5TmFtZSI6IlByYXZlZW4gTmFyYXlhbmFuIiwiZW1haWwiOiJwcmF2ZWVuQGtleXZhbHVlLnN5c3RlbXMiLCJpZCI6ImYzMjE3Nzc1LWFiNWUtNDIzNy1hZTliLTM0YjM4OGMzNmMxNSIsInJvbGUiOiJzdHVkZW50IiwiYmltYmVsSWQiOm51bGwsImlhdCI6MTU4NzAzMDQwNywiZXhwIjoxNjMxMzkzMjA3fQ.PwOH6spAG91Zy4iSqz979L5jPxI6xJP0rvPFl9w5pJw";

const headers: http.OutgoingHttpHeaders = {
    Authorization: `Bearer ${token}`
};
const clientReqArgs: http.ClientRequestArgs = {
    headers
};
const client = new WebSocket("ws://localhost:3000/tryout", clientReqArgs);

client.on("open", heartbeat);
client.on("ping", heartbeat);

client.on("close", function clear() {
    const ws = this as any;
    clearTimeout(ws.pingTimeout);
});
