# Отчёт — 20261012-subscriptions-wave3

Дата проверки: 2026-10-12. Машинные данные: `subscriptions.json`. Реестр URL: `checked-pages.json`.

## Покрытие

В `subscriptions.json` **16 записей** о продуктах/планах (15 подписок и 1 pay-as-you-go доступ Meta Contributor для Muse Spark 1.3 Contributor).

| Вендор    | Планы в партии                           |
| --------- | ---------------------------------------- |
| Cursor    | Pro, Pro Plus, Ultra                     |
| OpenAI    | ChatGPT Plus; Pro 100; Pro 500           |
| Anthropic | Claude Pro; Max 5x                       |
| Google    | AI Plus; AI Pro; AI Ultra $100           |
| Z.AI      | GLM Coding Plan Lite, Pro (кредиты)      |
| MiniMax   | M Plan (needs-context)                   |
| Meta      | Muse Code Everyday; Contributor API tier |

Приоритетный основной набор из `docs/model-scope.md` затронут через: Grok 4.7 и Composer 2.5 (Cursor), GPT-6.x / Codex (ChatGPT), Claude (Anthropic web+Code), Gemini 3.8 Flash (Google AI Pro), GLM-5.3/Flash (GLM Coding Plan), MiniMax-M3.1-Flash-Preview (M Plan, неполно), Muse Spark 1.3 Contributor (Meta API).

## Найденные лимиты (публикуемые единицы)

- **Cursor** — два пула (Cursor Models vs Other Models), сброс **monthly billing cycle**; фиксированный included volume не опубликован.
- **ChatGPT Plus** — оценки **15–160** (GPT-6.1 Sol), **5–45** (Astra), **350–3000** (Luna) **local messages / 5 h**; общий пул Codex + Work; контекст reasoning **256k** tokens (Plus).
- **ChatGPT Pro** — без 5h cap на local messages (learn); Ultrafast только Pro **$500**; множитель included usage **8×** для Ultrafast на included allowance.
- **Claude Pro** — ≥**5×** Free за **5 h**; недельные лимиты без чисел; Claude Code в том же пуле.
- **Claude Max 5x** — **5×** Pro / 5 h; **$100/mo** API credits на платформу.
- **Google AI Plus/Pro** — **2×** / **4×** compute limits vs Free; окно **5 h** до weekly cap; контекст **128k** / **1M** tokens; Pro **1000** Flow credits/mo, **5 TB** storage.
- **Google AI Ultra $100** — **5×** Pro в Gemini и Antigravity; **20 TB** storage (I/O 2026 blog).
- **GLM Coding Plan** — **2000/10000** credits (Lite 5h/week), **12000/60000** (Pro); off-peak **0.5×** credit rate; peak Mon–Fri 14:00–18:00 SGT.
- **Muse Code Everyday** — **10–50 prompts / 5 h** (диапазон официального текста).
- **Meta Contributor API** — **$0.10 / $0.20 / $1M** input/output/cached input; **100 RPM**, **3M TPM** per team.

## Цены (подтверждённые на дату проверки)

USD/month unless noted: Cursor **$20 / $60 / $200**; ChatGPT Plus **$20**, Pro **$100** and **$500** tiers; Claude Pro **$20** (or **$17** annual); Max from **$100** (5x tier recorded); Google AI Plus **$4.99**, Pro **$19.99**, Ultra **$100**; GLM Coding Plan entry **from $18** (exact Pro/Max USD on subscribe page not verified).

## Ошибки доступа

- Anthropic support article URL returned **404** (pricing taken from anthropic.com/pricing).
- MiniMax M Plan page — содержимое без тарифной таблицы.
- z.ai/subscribe — без извлекаемых цен в HTML.

## Необработанное

См. `open-questions.md`. Ключевое: числовые included quotas Cursor и ChatGPT Pro, цены GLM Pro/Max и Muse Code, полная матрица MiniMax M Plan, отдельные карточки Go / Pro 200 / Claude Max 20x / Google Ultra $199.99.
