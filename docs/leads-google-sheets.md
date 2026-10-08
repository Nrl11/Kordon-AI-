# Заявки с сайта → Google Таблица

Форма на `/start` отправляет заявку на `/api/lead`. Сервер проверяет её и
передаёт в веб-приложение Google Apps Script, которое дописывает строку
в таблицу. API-ключи Google Cloud для этого не нужны.

## 1. Таблица и скрипт

1. Создайте Google Таблицу, например «Кордон — заявки».
2. Меню **Расширения → Apps Script**, удалите пример и вставьте код:

```js
/* Принимает заявку с сайта Кордон AI и дописывает строку на лист «Заявки». */
function doPost(e) {
  const secret = PropertiesService.getScriptProperties().getProperty("SECRET");
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: "bad json" });
  }
  if (!secret || data.secret !== secret) return reply({ ok: false, error: "forbidden" });

  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName("Заявки") || book.insertSheet("Заявки");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Дата", "Номер", "Имя", "Компания", "Почта", "Телефон", "Сотрудников с ИИ", "Что важно", "Запрос цены", "Страница"]);
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([
    new Date(data.created),
    data.id, data.name, data.company, data.email, data.phone,
    data.size, data.focus, data.license, data.page,
  ]);
  return reply({ ok: true });
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
```

3. **Настройки проекта (шестерёнка) → Свойства скрипта → Добавить свойство**:
   `SECRET` = длинная случайная строка (например, из менеджера паролей).
4. **Начать развертывание → Новое развертывание → тип «Веб-приложение»**:
   - Запуск от имени: **я**;
   - У кого есть доступ: **все**.
   Подтвердите доступ к таблице и скопируйте URL вида `https://script.google.com/macros/s/…/exec`.

## 2. Переменные в Vercel

Project → Settings → Environment Variables (Production и Preview):

| Переменная | Значение |
| --- | --- |
| `LEADS_WEBHOOK_URL` | URL веб-приложения из шага 4 |
| `LEADS_WEBHOOK_SECRET` | тот же `SECRET`, что в свойствах скрипта |
| `NEXT_PUBLIC_SITE_URL` | боевой адрес сайта, например `https://kordon.ru` |

После сохранения — Redeploy. Значения никуда больше не пересылайте:
код читает их только на сервере.

## 3. Проверка

Отправьте тестовую заявку на `/start`: в таблице появится строка, на сайте —
пропуск с номером. Если переменные не заданы или скрипт не ответил, форма
покажет ошибку, а в логах Vercel будет запись `[lead] … не записана`.

## Важно про 152-ФЗ

Google хранит данные за пределами России. Это трансграничная передача, а по
ч. 5 ст. 18 152-ФЗ первичная запись персданных граждан РФ должна идти в базы
на территории России. Политика на сайте (`/privacy`) это честно описывает,
но юристу стоит решить, оставлять ли Google Таблицу. Если перейти на
хранилище в РФ (CRM, Битрикс24, своя база), достаточно поменять
`LEADS_WEBHOOK_URL` на адрес, который принимает тот же JSON и отвечает
`{"ok": true}`, и поправить раздел «Где хранятся данные» в политике.
