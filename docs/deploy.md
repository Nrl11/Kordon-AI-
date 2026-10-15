# Deploying the site

The site is a Next.js 16 app (`output: "standalone"`). It runs on Vercel as is, in Docker, or as a Node process
behind nginx.

## Environment variables

| Variable | When | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **at build time** | the production address, e.g. `https://www.example.com`. Canonical links, the sitemap, robots and OG links are built from it |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `LEADS_MAIL_TO` | at runtime | email delivery of requests, see `docs/leads-email.md` |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | at runtime | optional Telegram notifications, see `docs/leads-telegram.md` |

One channel is enough — a request is accepted if it reaches at least one. Without any, the live form shows an error
instead of losing requests silently. Keep secrets in the platform's secret store, never in the repository.

## Vercel

Import the repository, set the variables in Project → Settings → Environment Variables and deploy.

## Docker

```bash
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://www.example.com -t kordon-site .
docker run -p 3000:3000 --env-file kordon.env kordon-site
```

`/api/health` answers `ok` — use it as the liveness probe.

## Node behind nginx

Node.js 20.9 or newer:

```bash
npm ci
NEXT_PUBLIC_SITE_URL=https://www.example.com npm run build
npm run start -- -p 3000
```

Put nginx (or another reverse proxy) with HTTPS in front, pass `Host` and `X-Forwarded-Proto` through, and rate-limit
the form, for example:

```nginx
limit_req_zone $binary_remote_addr zone=lead:10m rate=5r/m;

location = /api/lead {
    limit_req zone=lead burst=3 nodelay;
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## After launch

1. The home page opens; `/robots.txt` and `/sitemap.xml` use the production domain.
2. A test request on `/start` arrives by email (and in the chat, if configured).
3. The server log has `[lead] request K-…` without errors. Logs never contain personal data — only the request
   number and company size.
