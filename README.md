# TEDxZhenysPark — лендинг + билеты

Лендинг + страница активации билетов + админка для менеджера + PWA-сканер для волонтёров.
Стек: **Next.js 16 (App Router) · Tailwind 4 · next-intl · Supabase**.

## Структура

| Маршрут | Что |
|---|---|
| `/` | KZ лендинг |
| `/en` | EN лендинг |
| `/t/[token]` | Страница билета: первая открытие → форма «Аты-Тегі» → QR. Повторные открытия сразу показывают QR. |
| `/admin/login` | Логин менеджера (Supabase Auth, email + пароль) |
| `/admin` | Список всех билетов |
| `/admin/new` | Создать билет → готовая ссылка для отправки покупателю в WhatsApp |
| `/admin/scan` | Сканер QR на входе (камера телефона) |

## Локальный запуск

```bash
npm install
npm run dev
```

## Supabase setup (требуется один раз)

1. **Применить миграцию.** Через CLI:
   ```bash
   supabase login
   supabase link --project-ref zxykpzdishvzrawsrwol
   supabase db push
   ```
   Либо вручную: открой `supabase/migrations/20260509000000_init_tickets.sql` и выполни в Supabase Dashboard → SQL Editor.

2. **Создать менеджеров.** Supabase Dashboard → Authentication → Users → Add user → email + пароль. Подтверждение email можно отключить в Auth Providers → Email → "Confirm email = off".

3. **Получить secret key (опционально).** Сейчас всё работает на publishable key + RLS. Если в будущем понадобятся серверные операции в обход RLS, добавь в `.env.local`:
   ```
   SUPABASE_SECRET_KEY=sb_secret_...
   ```

## Конфиг

Все правки контента — в коде, не в БД:

- `src/config/event.ts` — название, тема, дата, место, **спикеры**.
- `src/messages/kk.json`, `src/messages/en.json` — все тексты UI.
- `.env.local`:
  - `NEXT_PUBLIC_MANAGER_WHATSAPP` — номер для CTA «Билет алу» (формат `77001234567`, без `+` и пробелов)
  - `NEXT_PUBLIC_MANAGER_TELEGRAM` — username (без `@`)
  - `NEXT_PUBLIC_SITE_URL` — публичный домен (для абсолютных ссылок)

## Flow продажи билета

```
покупатель пишет менеджеру  →  менеджер на /admin/new создаёт билет
                            →  жмёт «WhatsApp» → ссылка уходит в чат
покупатель открывает ссылку →  вводит Аты-Тегі  →  получает QR
на входе                    →  волонтёр на /admin/scan сканирует QR
                            →  зелёный экран = пускать, жёлтый = уже использован
```

Статусы билета: `issued` → `activated` → `used`.

## Деплой на Vercel

1. Запушь в GitHub.
2. На Vercel → New Project → выбрать репо.
3. Environment Variables — скопировать всё из `.env.local`. Поменять `NEXT_PUBLIC_SITE_URL` на прод-домен.
4. Deploy.

Камера для сканера требует HTTPS — на Vercel это работает из коробки.

## Подменить контент

- Фото спикеров — добавить `photoUrl` в `src/config/event.ts` (загрузить в `public/speakers/...` или в Supabase Storage).
- Поменять цвета — `src/app/globals.css`, `--color-red`.
- Поменять CTA-кнопку — `buildBuyTicketLink()` в `src/config/event.ts`.
