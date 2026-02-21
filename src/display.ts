import {
  waitForEvenAppBridge,
  CreateStartUpPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
  OsEventTypeList,
  type EvenAppBridge,
} from "@evenrealities/even_hub_sdk";
import { config } from "./config";

const CONTAINER_ID = 1;
const CONTAINER_NAME = "chat";
const DISPLAY_WIDTH = 576;
const DISPLAY_HEIGHT = 288;

export class Display {
  private bridge: EvenAppBridge | null = null;
  private lastUpdateTime = 0;
  private pendingText: string | null = null;
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;

  async init(): Promise<void> {
    this.bridge = await waitForEvenAppBridge();

    await this.bridge.createStartUpPageContainer(
      new CreateStartUpPageContainer({
        containerTotalNum: 1,
        textObject: [
          new TextContainerProperty({
            containerID: CONTAINER_ID,
            containerName: CONTAINER_NAME,
            xPosition: 0,
            yPosition: 0,
            width: DISPLAY_WIDTH,
            height: DISPLAY_HEIGHT,
            content: "",
          }),
        ],
      })
    );

    this.bridge.onEvenHubEvent((event) => {
      const sysType =
        event.sysEvent?.eventType ??
        event.textEvent?.eventType;

      if (sysType === OsEventTypeList.DOUBLE_CLICK_EVENT) {
        this.bridge?.shutDownPageContainer(0);
      }
    });
  }

  updateText(text: string): void {
    const now = Date.now();
    const elapsed = now - this.lastUpdateTime;

    if (elapsed >= config.throttleInterval) {
      this.flush(text);
    } else {
      this.pendingText = text;
      if (!this.pendingTimer) {
        this.pendingTimer = setTimeout(() => {
          this.pendingTimer = null;
          if (this.pendingText !== null) {
            this.flush(this.pendingText);
            this.pendingText = null;
          }
        }, config.throttleInterval - elapsed);
      }
    }
  }

  private flush(text: string): void {
    this.lastUpdateTime = Date.now();
    this.bridge?.textContainerUpgrade(
      new TextContainerUpgrade({
        containerID: CONTAINER_ID,
        containerName: CONTAINER_NAME,
        content: text,
      })
    );
  }
}
