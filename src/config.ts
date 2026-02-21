export const config = {
  /** Twitch channel to join (without #) */
  channel: "xqc",

  /** Max total characters in the message buffer (textContainerUpgrade limit) */
  maxChars: 2000,

  /** Minimum interval between display updates (ms) */
  throttleInterval: 300,

  /** Max messages retained in the buffer */
  maxMessages: 50,

  /** Max characters for displayed username */
  maxUsernameLength: 15,

  /** Max characters for displayed message text */
  maxMessageLength: 200,
} as const;
