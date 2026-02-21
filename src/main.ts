import { waitForEvenAppBridge, type EvenAppBridge } from "@evenrealities/even_hub_sdk";
import { Display } from "./display";
import { MessageBuffer } from "./message-buffer";
import { connectTwitch } from "./twitch-client";
import { config } from "./config";
import { showSettings } from "./settings";

const log = (window as any)._log || console.log;

async function initBridge(): Promise<EvenAppBridge | null> {
  try {
    return await waitForEvenAppBridge();
  } catch {
    log("main: bridge unavailable, running in dev mode");
    return null;
  }
}

function showStatus(container: HTMLElement, channel: string): void {
  while (container.firstChild) container.removeChild(container.firstChild);
  const div = document.createElement("div");
  div.id = "status-view";
  const h2 = document.createElement("h2");
  h2.textContent = `Streaming #${channel}`;
  const p = document.createElement("p");
  p.textContent = "Chat messages are being sent to your glasses. Double-tap glasses to disconnect.";
  div.appendChild(h2);
  div.appendChild(p);
  container.appendChild(div);
}

async function main() {
  log("main: starting");

  const appEl = document.getElementById("app");
  if (!appEl) throw new Error("Missing #app element");

  // Phase 1: Init bridge + show settings
  log("main: init bridge...");
  const bridge = await initBridge();
  log("main: showing settings...");
  const settings = await showSettings(appEl, bridge);
  log(`main: settings → channel=${settings.channel}`);

  // Apply settings to mutable config
  Object.assign(config, settings);

  // Phase 2: Streaming
  showStatus(appEl, config.channel);

  const display = new Display();
  const buffer = new MessageBuffer();

  log("main: init display...");
  await display.init();
  log("main: display ready");
  display.updateText(`Connecting to #${config.channel}...`);

  log("main: connecting twitch...");
  await connectTwitch(config.channel, (username, message) => {
    const text = buffer.add(username, message);
    display.updateText(text);
  });
  log("main: twitch connected");
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  log("FATAL: " + msg);
});
