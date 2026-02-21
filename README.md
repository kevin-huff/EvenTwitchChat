# EvenTwitchChat

Twitch Chat Client for Even Realities G2 smart glasses. Streams live Twitch chat to the glasses display via the Even Hub SDK.

## How It Works

1. Open the app on your phone — a settings form lets you configure the channel and display options
2. Tap **Connect** — chat messages stream to your G2 glasses in real time
3. Double-tap the glasses to disconnect

Settings are saved automatically and restored on next launch.

## Settings

| Setting | Description | Range |
|---------|-------------|-------|
| **Channel** | Twitch channel to join | any channel name |
| **Show Usernames** | Display who sent each message | on/off |
| **Username Length** | Max characters for usernames | 5–25 |
| **Message Format** | `user: msg`, `> msg`, or `msg only` | select |
| **Update Speed** | How often the display refreshes | 100ms–1000ms |
| **Lines to Show** | Number of messages visible on screen | 3–15 |
| **Newest First** | Show newest messages at the top | on/off |

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output goes to `dist/` — deploy as an Even Hub web app.

## Tech

- [Even Hub SDK](https://www.npmjs.com/package/@evenrealities/even_hub_sdk) — glasses display + storage
- [tmi.js](https://tmijs.com/) — Twitch IRC client
- [Vite](https://vite.dev/) — build tooling
