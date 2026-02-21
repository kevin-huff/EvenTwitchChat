import { config } from "./config";

/** Strip characters the G2 display can't render (emoji, symbols, etc.) */
function stripUnsupported(text: string): string {
  // Keep basic ASCII printable (0x20-0x7E) and common Latin-1 Supplement (0xA0-0xFF)
  return text.replace(/[^\x20-\x7E\xA0-\xFF]/g, "").trim();
}

export class MessageBuffer {
  private messages: string[] = [];

  add(username: string, message: string): string {
    const cleanUser = stripUnsupported(username);
    const cleanMsg = stripUnsupported(message);

    if (!cleanMsg) return this.getText();

    const truncatedUser =
      cleanUser.length > config.maxUsernameLength
        ? cleanUser.slice(0, config.maxUsernameLength)
        : cleanUser || "???";
    const truncatedMsg =
      cleanMsg.length > config.maxMessageLength
        ? cleanMsg.slice(0, config.maxMessageLength) + "..."
        : cleanMsg;

    this.messages.push(`${truncatedUser}: ${truncatedMsg}\n`);

    if (this.messages.length > config.maxMessages) {
      this.messages.splice(0, this.messages.length - config.maxMessages);
    }

    // Trim oldest messages until total chars fit within limit
    while (this.totalChars() > config.maxChars && this.messages.length > 1) {
      this.messages.shift();
    }

    return this.getText();
  }

  getText(): string {
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
