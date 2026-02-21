import { Display } from "./display";
import { MessageBuffer } from "./message-buffer";
import { connectTwitch } from "./twitch-client";
import { config } from "./config";

async function main() {
  const display = new Display();
  const buffer = new MessageBuffer();

  await display.init();
  display.updateText(`Connecting to #${config.channel}...`);

  await connectTwitch((username, message) => {
    const text = buffer.add(username, message);
    display.updateText(text);
  });
}

main().catch((err) => console.error("EvenTwitchChat fatal:", err));
