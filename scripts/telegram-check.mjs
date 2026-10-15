// Helper for connecting the request bot (docs/leads-telegram.md).
// The token comes only from the TELEGRAM_BOT_TOKEN environment variable —
// don't put it in code and don't paste it into a browser address bar.
//
//   npm run tg:check           — the bot name and the chats it was added to (with IDs)
//   npm run tg:check -- --send — a test message to TELEGRAM_CHAT_ID

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is not set. Set it in the environment and run again:");
  console.error('  bash:       TELEGRAM_BOT_TOKEN="…" npm run tg:check');
  console.error('  PowerShell: $env:TELEGRAM_BOT_TOKEN="…"; npm run tg:check');
  process.exit(1);
}

async function api(method, body = {}) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  const out = await res.json().catch(() => null);
  if (!out?.ok) throw new Error(out?.description || `HTTP ${res.status}`);
  return out.result;
}

try {
  const me = await api("getMe");
  console.log(`Bot: @${me.username} — ${me.first_name}`);

  if (process.argv.includes("--send")) {
    const chat = process.env.TELEGRAM_CHAT_ID;
    if (!chat) throw new Error("set TELEGRAM_CHAT_ID for --send");
    await api("sendMessage", { chat_id: chat, text: "Test: the Kordon AI website request bot is connected." });
    console.log(`Test message sent to chat ${chat}.`);
  } else {
    const updates = await api("getUpdates", { allowed_updates: ["message", "my_chat_member"] });
    const chats = new Map();
    const moved = new Map();
    for (const u of updates) {
      const m = u.message ?? u.my_chat_member;
      if (m?.chat) chats.set(m.chat.id, m.chat);
      /* a regular group became a supergroup — it has a new ID */
      if (u.message?.migrate_to_chat_id) moved.set(u.message.chat.id, u.message.migrate_to_chat_id);
    }
    if (chats.size === 0) {
      console.log("No chats yet. Add the bot to a group, send /start there and run again.");
    } else {
      console.log("Chats where the bot saw messages (use the ID as TELEGRAM_CHAT_ID):");
      for (const c of chats.values()) {
        if (moved.has(c.id)) continue;
        console.log(`  ${c.id}   ${c.title ?? c.username ?? c.first_name}   (${c.type})`);
      }
    }
  }
} catch (e) {
  console.error(`Error: ${e instanceof Error ? e.message : e}`);
  console.error("Unauthorized — wrong token; chat not found — wrong ID or the bot isn't in the group.");
  process.exit(1);
}
