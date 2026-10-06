# Premier Agency

Сайт на React и TypeScript. Форма параллельно отправляет заявку по двум каналам:

- В Telegram через существующий Cloudflare Worker (`POST /send-data`).
- На почту через Web3Forms напрямую из браузера (`POST https://api.web3forms.com/submit`).

Заявка считается отправленной, если хотя бы один канал подтвердил успех. Если оба завершились ошибкой, форма показывает ошибку и сохраняет введённые данные для повторной попытки. Успех только Telegram не гарантирует доставку письма, поэтому настройку Web3Forms нужно проверить отдельно.

## Почта Web3Forms

Адрес из контактов — `CONTACT_EMAIL` в [src/consts.ts](src/consts.ts), сейчас `katieza@me.com`. Для доставки на этот адрес `WEB_3_API_ACCESS_KEY` в том же файле должен быть выпущен Web3Forms именно для `katieza@me.com`.

Создайте ключ на [Web3Forms](https://web3forms.com/#start), указав почту получателя, получите его на этой почте и сохраните в `WEB_3_API_ACCESS_KEY`. При изменении `CONTACT_EMAIL` замените и ключ на выпущенный для нового адреса: изменение одной константы почты не переключает получателя Web3Forms. [Инструкция подключения](https://docs.web3forms.com/getting-started/installation)

Поле `email` в заявке содержит рабочую почту посетителя для ответа. Получателя определяет access key, а не это поле. Ключ Web3Forms предназначен для использования в браузере и может быть публичным. [FAQ Web3Forms](https://docs.web3forms.com/getting-started/faq)

В письме передаются имя, рабочая почта, тема и дата встречи по Москве. Web3Forms получает `FormData`; браузер самостоятельно задаёт `Content-Type` с границей multipart. Ручные заголовки для этого запроса не добавляются. Такой способ используется в [примере простой React-формы Web3Forms](https://docs.web3forms.com/how-to-guides/js-frameworks/react-js/simple-react-contact-form) и не требует предварительного CORS-запроса `OPTIONS`. Telegram продолжает получать JSON.

В автоматической проверке опубликованного сайта через headless Chrome JSON-запрос Web3Forms остановился на предварительном `OPTIONS`: сервер вернул `403` с проверкой Cloudflare без разрешающих CORS-заголовков, и браузер не отправил основной `POST`. Один диагностический запрос с `FormData` от origin `https://vinodell.github.io` отправил `POST` без `OPTIONS`, но браузер не смог прочитать ответ: `TypeError: Failed to fetch`, причина CORS — `MissingAllowOriginHeader`. HTTP-статус и JSON-подтверждение успеха этого `POST` недоступны, доставка письма не подтверждена. Этот результат относится к автоматической проверке; воспроизведение в обычном браузере пользователя ещё не проверено. `FormData` устраняет предварительный запрос, но ответ основного `POST` всё ещё должен разрешать CORS. Подтверждение API не гарантирует попадание письма во входящие.

Если заявка приходит только в Telegram, откройте инструменты разработчика браузера перед отправкой. В Console ищите предупреждение `Отправка формы: Web3Forms не подтвердил отправку.` с HTTP-статусом и причиной, если сервис вернул ответ. В Network проверьте запрос `api.web3forms.com/submit` и его ответ: успех требует успешного HTTP-статуса и `success: true` в JSON. При отказе браузера прочитать ответ подробности CORS видны в Console. Если API подтвердил успех, проверьте получателя в настройках формы Web3Forms и папку «Спам»; ограничения домена, квоту и блокировку почты после bounce проверяют в кабинете или через поддержку. При неясном результате не повторяйте отправку автоматически: письмо могло быть принято, даже если браузер не смог прочитать ответ. [Решение проблем Web3Forms](https://docs.web3forms.com/getting-started/troubleshooting)

## Telegram

Из корня проекта сохраните секреты существующего Worker:

```sh
npx wrangler secret put TELEGRAM_BOT_TOKEN --name premier
npx wrangler secret put TELEGRAM_CHAT_ID --name premier
npx wrangler secret list --name premier
```

Токен бота хранится только в Worker. Настройка почты Web3Forms не требует изменений этого обработчика.

## Разработка и проверки

```sh
npm ci
npm run dev
```

Проверки перед публикацией:

```sh
npm run typecheck
npm run lint
npm run test -- --watchAll=false
npm run build
```

## Публикация

Workflow [deploy.yml](.github/workflows/deploy.yml) публикует интерфейс в GitHub Pages при изменениях в `main`. Отправка на Web3Forms работает со статического сайта без собственного почтового сервера.

Cloudflare Worker для Telegram публикуется отдельно. Команда из корня проекта собирает сайт и публикует Worker с ресурсами сайта:

```sh
npm run deploy
```

Для добавления Web3Forms достаточно обновить интерфейс; отдельная публикация неизменённого обработчика Telegram не требуется.
