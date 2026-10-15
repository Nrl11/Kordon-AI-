# Requests → email

The form on `/start` posts to `/api/lead`. The server validates the request and sends an email from a dedicated
sender mailbox to your team (`LEADS_MAIL_TO`). The email has every field of the request, and “Reply” goes straight
to the client. At the same time a bot can post to Telegram (`docs/leads-telegram.md`). A request is accepted if it
reaches at least one of the two; if it reaches neither, the form shows an error.

## 1. A sender mailbox

Use a dedicated mailbox, for example `website@yourcompany.com` in Google Workspace or Microsoft 365, or any SMTP
service (Postmark, SendGrid, Amazon SES). Don't use a person's own mailbox. Create an app password or SMTP
credentials just for the website, so they can be revoked at any time.

## 2. Environment variables

| Variable | Value |
| --- | --- |
| `SMTP_HOST` | your SMTP server, e.g. `smtp.gmail.com`, `smtp.office365.com`, `smtp.postmarkapp.com` |
| `SMTP_PORT` | optional, `465` (SSL) by default; use `587` for STARTTLS |
| `SMTP_USER` | the sender login |
| `SMTP_PASS` | the app password or SMTP token |
| `LEADS_MAIL_TO` | who receives requests; several addresses separated by commas |
| `LEADS_MAIL_FROM` | optional, `SMTP_USER` by default; many providers only send from the authenticated address |

Restart the site after changing them. Keep the values out of the repository: the code reads them on the server only.

## 3. Check

Send a test request on `/start`: an email “Request K-… — Company, size” arrives at `LEADS_MAIL_TO`, and the page
shows a pilot pass with the number. If there's no email, the server log has `[lead] request … didn't reach email: …`
with the reason (wrong credentials, a sender address the provider rejects, or outbound SMTP blocked).
