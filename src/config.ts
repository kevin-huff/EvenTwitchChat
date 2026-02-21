export interface Settings {
  channel: string;
  showUsernames: boolean;
  maxUsernameLength: number;
  messageFormat: "user: msg" | "> msg" | "msg";
  throttleInterval: number;
  maxMessages: number;
  newestFirst: boolean;
}

/** Hardware limits — not user-configurable */
export const MAX_CHARS = 2000;
export const MAX_MESSAGE_LENGTH = 200;

export const defaults: Settings = {
  channel: "",
  showUsernames: true,
  maxUsernameLength: 15,
  messageFormat: "user: msg",
  throttleInterval: 300,
  maxMessages: 8,
  newestFirst: true,
};

/** Mutable runtime config — populated from settings UI before streaming starts */
export const config: Settings = { ...defaults };
