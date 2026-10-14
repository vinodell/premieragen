# Premier Agency

Сайт на React и TypeScript. Форма параллельно отправляет заявку в Telegram через Cloudflare Worker и на email через Web3Forms. Заявка считается отправленной, если хотя бы один канал подтвердил доставку. Обязательный чекбокс согласия проверяется перед отправкой; факт согласия, время и версия передаются вместе с заявкой.

## Разработка и сборка

```sh
npm ci
npm run dev
```

`npm run build` собирает сайт для GitHub Pages с префиксом `/premieragen/`. `npm run build:cloudflare` собирает сайт для корня домена Cloudflare. Команды `npm run preview` и `npm run deploy` используют эту сборку; `preview` запускает локальный Wrangler, а `deploy` публикует Worker и статические файлы.

## Проверки

```sh
npm run typecheck
npm run lint
CI=true npm test -- --watchAll=false --runInBand
npm --prefix worker ci
npm --prefix worker test -- --run
```

## Telegram

Из корня проекта сохраните секреты существующего Worker:

```sh
npx wrangler secret put TELEGRAM_BOT_TOKEN --name premier
npx wrangler secret put TELEGRAM_CHAT_ID --name premier
npx wrangler secret list --name premier
```

## Web3Forms и согласие

В `src/consts.ts` укажите ключ `WEB_3_API_ACCESS_KEY`, выпущенный для адреса `CONTACT_EMAIL`. Это публичный ключ формы; секрет Telegram хранится только в Worker.

Перед публикацией заполните полные реквизиты в `PERSONAL_DATA_OPERATOR`. Отдельные документы доступны по `/#personal-data-consent` и `/#privacy-policy` с учётом префикса сайта. Общая версия согласия для формы и Worker задаётся в `src/consent.ts`. Проверки используют тестовые ответы сервисов и не отправляют настоящие заявки.
