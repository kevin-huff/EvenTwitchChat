import tmi from "tmi.js";
import { config } from "./config";

export type MessageCallback = (username: string, message: string) => void;

export function connectTwitch(onMessage: MessageCallback): Promise<void> {
  const client = new tmi.Client({
    connection: {
      secure: true,
      reconnect: true,
    },
    channels: [config.channel],
  });

  client.on("message", (_channel, tags, message, self) => {
    if (self) return;
    const username = tags["display-name"] || tags.username || "???";
    onMessage(username, message);
  });

  return client.connect().then(() => {
    console.log(`Connected to #${config.channel}`);
  });
}
