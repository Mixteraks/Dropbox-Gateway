import "dotenv/config";
import { EventSource } from 'eventsource';
import { redis } from "../lib/redis.js";

const client = redis

const activeConnections = new Map();

const connectToSSE = (id, ip, port, attempts=0) => {
    const MAX_ATTEMPTS = 5;
    if (activeConnections.has(id)) {
        activeConnections.get(id).close();
    }

    const es = new EventSource(`http://${ip}:${port}/heartbeat`);
    activeConnections.set(id, es);

    es.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        const safeId = id.replaceAll(':', '-');
        
        await client.set(`heartbeat:${safeId}`, JSON.stringify(data), { EX: 60 });
    };

    es.onerror = () => {
        if (attempts >= MAX_ATTEMPTS) {
            console.error(`SSE ${id} closed`);
            es.close();
            activeConnections.delete(id);
            return;
        }
        // EventSource sam zrobi reconnect, ale możesz to też śledzić
        console.warn(`SSE connection error ${id} (${attempts + 1}/${MAX_ATTEMPTS})`);
    };

    es.onopen = () => console.log(`Connected ${id}@${ip}:${port}`);
};


export {connectToSSE}