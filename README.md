# Premier Agency

Сайт на React и TypeScript. Форма параллельно отправляет заявку по двум каналам:

- В Telegram через существующий Cloudflare Worker (`POST /send-data`).
- На почту через Web3Forms напрямую из браузера (`POST https://api.web3forms.com/submit`).

Заявка считается отправленной, если хотя бы один канал подтвердил успех. Если оба завершились ошибкой, форма показывает ошибку и сохраняет введённые данные для повторной попытки. Успех только Telegram не гарантирует доставку письма, поэтому настройку Web3Forms нужно проверить отдельно.

## Почта Web3Forms

Адрес из контактов — `CONTACT_EMAIL` в [src/consts.ts](src/consts.ts), сейчас `katieza@me.com`. Для доставки на этот адрес `WEB_3_API_ACCESS_KEY` в том же файле должен быть выпущен Web3Forms именно для `katieza@me.com`.

Создайте ключ на [Web3Forms](https://web3forms.com/#start), указав почту получателя, получите его на этой почте и сохраните в `WEB_3_API_ACCESS_KEY`. При изменении `CONTACT_EMAIL` замените и ключ на выпущенный для нового адреса: изменение одной константы почты не переключает получателя Web3Forms. [Инструкция подключения](https://docs.web3forms.com/getting-started/installation)

Поле `email` в заявке содержит рабочую почту посетителя для ответа. Получателя определяет access key, а не это поле. Ключ Web3Forms предназначен для использования в браузере и может быть публичным. [FAQ Web3Forms](https://docs.web3forms.com/getting-started/faq)

В письме передаются имя, рабочая почта, тема и дата встречи по Москве. При проверке доставки смотрите ответ Web3Forms и папку «Спам» у получателя. [Пример для React](https://docs.web3forms.com/how-to-guides/js-frameworks/react-js/simple-react-contact-form), [решение проблем](https://docs.web3forms.com/getting-started/troubleshooting)

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
