# Getting Started with Create React App

just another custom website

## Форма заявки

Форма отправляет JSON на `POST https://premier.max-khamitov.workers.dev/send-data`.
Дата передаётся в UTC; в Telegram показывается московское время.
Worker разрешает GitHub Pages, собственный домен workers.dev и localhost.

Перед первой публикацией задайте секреты (значения не добавляйте в код):
```sh
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
```

Из корня проекта `npm run deploy` собирает сайт и публикует Worker вместе со статикой.
Для GitHub Pages также опубликуйте обновлённую сборку фронтенда привычным способом.
Обе конфигурации Wrangler указывают на один Worker и один каталог сборки.

Проверки:
```sh
npm run typecheck
npm run lint
CI=true npm test -- --watchAll=false
npm run build
npm --prefix worker test -- --run
```

Проверка CORS без отправки сообщения:
```sh
curl -i -X OPTIONS https://premier.max-khamitov.workers.dev/send-data \
  -H 'Origin: https://vinodell.github.io' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
```
Ожидаются статус 204 и `Access-Control-Allow-Origin: https://vinodell.github.io`.
