# Запуск сайта на своём сервере

Сайт — приложение Next.js 16. Vercel не нужен: на сервере работает
обычный Node-процесс `next start`, перед ним — nginx с HTTPS.

## Что нужно на сервере

- Node.js 20.9 или новее (лучше 22 LTS) и npm.
- nginx (или другой обратный прокси) с сертификатом для домена.
- Исходящие соединения:
  - `smtp.mail.ru:465` — письма с заявками;
  - `api.telegram.org:443` — сообщения бота.
  Если провайдер их режет, заявки не уйдут — в логах будет таймаут.

## Переменные окружения

| Переменная | Когда нужна | Значение |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **при сборке** | боевой адрес, например `https://kordon.ru`. Из него собираются canonical, sitemap, robots и OG-ссылки. Без неё всё будет указывать на старый адрес `kordon-ai.vercel.app` |
| `SMTP_USER`, `SMTP_PASS` | при запуске | ящик-робот и пароль приложения, см. `docs/leads-email.md` |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | при запуске | бот и чат, см. `docs/leads-telegram.md` |
| `SMTP_HOST`, `SMTP_PORT`, `LEADS_MAIL_TO`, `LEADS_MAIL_FROM` | не обязательно | по умолчанию `smtp.mail.ru`, `465`, `ai@webpractik.ru`, `SMTP_USER` |

Достаточно одной пары — почты или Telegram: заявка принимается, если дошла
хотя бы в одно место. Без обеих форма честно показывает ошибку.

Секреты храните в файле окружения сервиса (например,
`/etc/kordon-site.env`, права `600`) или в секретах CI — не в репозитории.
Файлы `.env*` в git не попадают.

## Сборка и запуск

```bash
npm ci
NEXT_PUBLIC_SITE_URL=https://kordon.ru npm run build
npm run start -- -p 3000
```

Пример службы systemd `/etc/systemd/system/kordon-site.service`:

```ini
[Unit]
Description=Kordon AI site
After=network.target

[Service]
WorkingDirectory=/srv/kordon-site
EnvironmentFile=/etc/kordon-site.env
ExecStart=/usr/bin/npm run start -- -p 3000
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

Обновление: `git pull && npm ci && npm run build` (с `NEXT_PUBLIC_SITE_URL`),
затем `systemctl restart kordon-site`.

## nginx

```nginx
limit_req_zone $binary_remote_addr zone=lead:10m rate=5r/m;

server {
    listen 443 ssl http2;
    server_name kordon.ru;
    # ssl_certificate …; ssl_certificate_key …;

    client_max_body_size 1m;

    # форма заявки — не больше 5 запросов в минуту с одного адреса
    location = /api/lead {
        limit_req zone=lead burst=3 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name kordon.ru www.kordon.ru;
    return 301 https://kordon.ru$request_uri;
}
```

`Host` и `X-Forwarded-Proto` передавайте как есть: по ним сайт
перенаправляет адрес в верхнем регистре (KORDON.RU) на нижний.

## Проверка после запуска

1. Открывается главная, `/robots.txt` и `/sitemap.xml` содержат боевой домен.
2. Тестовая заявка на `/start` приходит письмом и в чат.
3. В логах службы (`journalctl -u kordon-site`) есть строка
   `[lead] заявка K-…` без ошибок. Персональных данных в логах нет —
   только номер заявки и размер компании.
