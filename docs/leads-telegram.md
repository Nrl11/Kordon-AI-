# Requests → Telegram chat

When someone sends the form on `/start`, a bot posts every field of the request to your team chat: number, name,
company, email, phone, company size, focus, pricing request, time and page. The email channel
(`docs/leads-email.md`) works in parallel; if one of them is down, the request isn't lost.

## 1. The bot

1. In Telegram open [@BotFather](https://t.me/BotFather) → `/newbot`.
2. Pick a name, e.g. “Kordon requests”, and a username, e.g. `kordon_requests_bot`.
3. BotFather replies with a token like `1234567890:AA…`. It's the bot's password: don't paste it into chats or emails.

## 2. The chat

1. Create a group, e.g. “Kordon requests”, and add the bot and the people who answer requests.
2. Send `/start` in the group.
3. Run the helper — it prints the bot name and the group ID:

   ```bash
   TELEGRAM_BOT_TOKEN="token" npm run tg:check
   ```

   The group ID is a negative number, e.g. `-1001234567890`. If no chats show up, send `/start` again and rerun.

## 3. Environment variables

| Variable | Value |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | the token from step 1 |
| `TELEGRAM_CHAT_ID` | the group ID from step 2 |

Restart the site after changing them. The code reads them on the server only.

## 4. Check

First the server's connection to Telegram — a test message to the group:

```bash
TELEGRAM_BOT_TOKEN="token" TELEGRAM_CHAT_ID="-100…" npm run tg:check -- --send
```

Then send a test request on `/start`. If nothing arrives, the server log has `[lead] request … didn't reach Telegram: …`:
`Unauthorized` — wrong token; `chat not found` — wrong ID or the bot isn't in the group; `group chat was upgraded to a
supergroup` — the group changed its ID, repeat step 2.3.

The message contains the client's contact details. If your privacy policy or company rules don't allow that in a
messenger, keep only the email channel.
