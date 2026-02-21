import { config, MAX_CHARS, MAX_MESSAGE_LENGTH } from "./config";

/** Strip characters the G2 display can't render (emoji, symbols, etc.) */
function stripUnsupported(text: string): string {
  // Keep basic ASCII printable (0x20-0x7E) and common Latin-1 Supplement (0xA0-0xFF)
  return text.replace(/[^\x20-\x7E\xA0-\xFF]/g, "").trim();
}

export class MessageBuffer {
  private messages: string[] = [];

  add(username: string, message: string): string {
    const cleanMsg = stripUnsupported(message);
    if (!cleanMsg) return this.getText();

    const truncatedMsg =
      cleanMsg.length > MAX_MESSAGE_LENGTH
        ? cleanMsg.slice(0, MAX_MESSAGE_LENGTH) + "..."
        : cleanMsg;

    let line: string;
    if (config.showUsernames && config.messageFormat === "user: msg") {
      const cleanUser = stripUnsupported(username);
      const truncatedUser =
        cleanUser.length > config.maxUsernameLength
          ? cleanUser.slice(0, config.maxUsernameLength)
          : cleanUser || "???";
      line = `${truncatedUser}: ${truncatedMsg}\n`;
    } else if (config.showUsernames && config.messageFormat === "> msg") {
      line = `> ${truncatedMsg}\n`;
    } else {
      line = `${truncatedMsg}\n`;
    }

    this.messages.push(line);

    if (this.messages.length > config.maxMessages) {
      this.messages.splice(0, this.messages.length - config.maxMessages);
    }

    // Trim oldest messages until total chars fit within limit
    while (this.totalChars() > MAX_CHARS && this.messages.length > 1) {
      this.messages.shift();
    }

    return this.getText();
  }

  getText(): string {
    if (config.newestFirst) {
      const reversed = [];
      for (let i = this.messages.length - 1; i >= 0; i--) {
        reversed.push(this.messages[i]);
      }
      return reversed.join("");
    }
    return this.messages.join("");
  }

  private totalChars(): number {
    let total = 0;
    for (const msg of this.messages) {
      total += msg.length;
    }
    return total;
  }
}
