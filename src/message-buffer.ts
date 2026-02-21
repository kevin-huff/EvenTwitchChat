import { config } from "./config";

export class MessageBuffer {
  private messages: string[] = [];

  add(username: string, message: string): string {
    const truncatedUser =
      username.length > config.maxUsernameLength
        ? username.slice(0, config.maxUsernameLength)
        : username;
    const truncatedMsg =
      message.length > config.maxMessageLength
        ? message.slice(0, config.maxMessageLength) + "…"
        : message;

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
