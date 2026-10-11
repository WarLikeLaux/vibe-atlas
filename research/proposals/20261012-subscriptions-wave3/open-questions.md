# Открытые вопросы — 20261012-subscriptions-wave3

Проверка: 2026-10-12.

## Цены и тарифы

1. **GLM Coding Plan (Lite / Pro / Max)** — в `docs.z.ai/devpack/overview` подтверждены кредиты и минимум «18 USD per month», но публичная страница `z.ai/subscribe` не отдала проверяемые USD-цены Pro ($80) и Max ($168) без авторизованного checkout. Нужна сверка с экраном подписки в консоли Z.AI.
2. **MiniMax M Plan** — `minimax.io/m-plan` не раскрыл названия тарифов, месячные цены и включённые токены/кредиты. Документация подтверждает только привязку `MiniMax-M3.1-Flash-Preview` к M Plan и MiniMax Code.
3. **Muse Code (Everyday / High / Power)** — лимиты в промптах за 5 часов описаны, месячная плата показывается только в Accounts Center при оформлении.
4. **Cursor Pro / Pro Plus / Ultra** — месячные цены подтверждены; **объём включённого usage** в пулах Cursor Models и Other Models на публичной документации не выражен в токенах, долларах или запросах (только сброс по billing cycle и on-demand по API-ставкам).

## Лимиты и окна

1. **ChatGPT Pro 100 / 200** — Help Center не публикует числовые included allowances; сравнение только качественное («Pro 500 highest»). Оценки 15–160 сообщений за 5 ч относятся к Plus, не к Pro.
2. **Anthropic Claude** — множители 5×/20× к Pro на сессию 5 ч подтверждены; **недельные потолки** и точные message counts не раскрыты на странице pricing.
3. **Google AI** — лимиты Gemini Apps заданы как кратные Free (2× / 4× / 5× или 20× к Pro для Ultra) и compute-based; **абсолютные дневные prompt counts** с пост-I/O 2026 могут отличаться по региону и не были сверены по дашборду пользователя.

## Охват и границы

1. **ChatGPT Go ($8)** и **ChatGPT Pro 200 ($200)** — не вынесены отдельными записями в `subscriptions.json` (есть Plus, Pro 100, Pro 500); при интеграции добавить при необходимости полной матрицы consumer-планов.
2. **Google AI Ultra $199.99** (20× Pro) — описан в блоге и на gemini.google/subscriptions, отдельная карточка в JSON не создана (достаточно Ultra $100 для партии).
3. **Anthropic Max 20x ($200/mo)** — не добавлена отдельная запись; на pricing указано «From $100» с выбором 5× или 20×.
4. **Пересечение с 20261012-vendor-recommendations-wave3** — здесь только условия доступа и лимиты; рекомендации вендоров не собирались.

## Доступ и регионы

1. Региональные цены Google AI (не-US) и план **Cursor Start (India, ₹649/mo)** — упомянуты в документации Cursor, отдельная карточка не заполнена.
2. **Gemini 3.8 Flash** в Google AI Plus vs Pro — на странице subscriptions у Plus указаны модели до 3.6 Flash, у Pro — 3.8 Flash; для каталога приоритета 3.8 Flash релевантен в основном Pro/Ultra.
