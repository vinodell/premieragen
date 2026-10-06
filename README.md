# Premier Agency

Сайт на React и TypeScript. Форма параллельно отправляет заявку по двум каналам:

## Telegram

Из корня проекта сохраните секреты существующего Worker:

```sh
npx wrangler secret put TELEGRAM_BOT_TOKEN --name premier
npx wrangler secret put TELEGRAM_CHAT_ID --name premier
npx wrangler secret list --name premier
```
