import { type Settings, defaults } from "./config";
import { type EvenAppBridge } from "@evenrealities/even_hub_sdk";

const STORAGE_KEY = "evenTwitchChat_settings";

async function loadSettings(bridge: EvenAppBridge | null): Promise<Partial<Settings>> {
  try {
    const raw = bridge
      ? await bridge.getLocalStorage(STORAGE_KEY)
      : localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupted data
  }
  return {};
}

async function saveSettings(settings: Settings, bridge: EvenAppBridge | null): Promise<void> {
  const json = JSON.stringify(settings);
  try {
    if (bridge) {
      await bridge.setLocalStorage(STORAGE_KEY, json);
    } else {
      localStorage.setItem(STORAGE_KEY, json);
    }
  } catch {
    // best-effort
  }
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Build the settings form using safe DOM methods, then attach it to `container`.
 * Returns a Promise that resolves with the chosen Settings when the user taps Connect.
 *
 * NOTE: The form HTML is a static template with only escaped/numeric interpolations —
 * all user-supplied values go through `escapeAttr()` before insertion.
 */
export function showSettings(
  container: HTMLElement,
  bridge: EvenAppBridge | null,
): Promise<Settings> {
  return new Promise(async (resolve) => {
    const saved = await loadSettings(bridge);
    const s = { ...defaults, ...saved };

    // Build form from static template — dynamic values are escaped or numeric
    const formHtml = `
      <form id="settings-form" autocomplete="off">
        <h1>EvenTwitchChat</h1>

        <label for="channel">Channel</label>
        <input id="channel" type="text" value="${escapeAttr(s.channel)}" placeholder="channel name" required />

        <label class="checkbox-row">
          <input id="showUsernames" type="checkbox" ${s.showUsernames ? "checked" : ""} />
          Show Usernames
        </label>

        <div id="username-opts" style="${s.showUsernames ? "" : "display:none"}">
          <label for="maxUsernameLength">Username Length: <span id="usernameLen-val">${s.maxUsernameLength}</span></label>
          <input id="maxUsernameLength" type="range" min="5" max="25" value="${s.maxUsernameLength}" />
        </div>

        <label for="messageFormat">Message Format</label>
        <select id="messageFormat">
          <option value="user: msg" ${s.messageFormat === "user: msg" ? "selected" : ""}>user: msg</option>
          <option value="> msg" ${s.messageFormat === "> msg" ? "selected" : ""}>> msg</option>
          <option value="msg" ${s.messageFormat === "msg" ? "selected" : ""}>msg only</option>
        </select>

        <label for="throttleInterval">Update Speed: <span id="throttle-val">${s.throttleInterval}ms</span></label>
        <input id="throttleInterval" type="range" min="100" max="1000" step="50" value="${s.throttleInterval}" />
        <div class="range-labels"><span>Fast</span><span>Battery Saver</span></div>

        <label for="maxMessages">Lines to Show: <span id="lines-val">${s.maxMessages}</span></label>
        <input id="maxMessages" type="range" min="3" max="15" step="1" value="${s.maxMessages}" />

        <label class="checkbox-row">
          <input id="newestFirst" type="checkbox" ${s.newestFirst ? "checked" : ""} />
          Newest Messages First
        </label>

        <button type="submit" id="connect-btn">Connect</button>
      </form>
    `;
    container.innerHTML = formHtml; // safe: only escaped/numeric interpolations

    const form = container.querySelector("#settings-form") as HTMLFormElement;
    const showUser = form.querySelector("#showUsernames") as HTMLInputElement;
    const usernameOpts = form.querySelector("#username-opts") as HTMLElement;
    const usernameLenSlider = form.querySelector("#maxUsernameLength") as HTMLInputElement;
    const usernameLenVal = form.querySelector("#usernameLen-val") as HTMLElement;
    const throttleSlider = form.querySelector("#throttleInterval") as HTMLInputElement;
    const throttleVal = form.querySelector("#throttle-val") as HTMLElement;
    const linesSlider = form.querySelector("#maxMessages") as HTMLInputElement;
    const linesVal = form.querySelector("#lines-val") as HTMLElement;
    const newestFirst = form.querySelector("#newestFirst") as HTMLInputElement;

    showUser.addEventListener("change", () => {
      usernameOpts.style.display = showUser.checked ? "" : "none";
    });
    usernameLenSlider.addEventListener("input", () => {
      usernameLenVal.textContent = usernameLenSlider.value;
    });
    throttleSlider.addEventListener("input", () => {
      throttleVal.textContent = throttleSlider.value + "ms";
    });
    linesSlider.addEventListener("input", () => {
      linesVal.textContent = linesSlider.value;
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const channel = (form.querySelector("#channel") as HTMLInputElement).value.trim().replace(/^#/, "");
      if (!channel) return;

      const settings: Settings = {
        channel,
        showUsernames: showUser.checked,
        maxUsernameLength: Number(usernameLenSlider.value),
        messageFormat: (form.querySelector("#messageFormat") as HTMLSelectElement).value as Settings["messageFormat"],
        throttleInterval: Number(throttleSlider.value),
        maxMessages: Number(linesSlider.value),
        newestFirst: newestFirst.checked,
      };

      await saveSettings(settings, bridge);
      resolve(settings);
    });
  });
}
