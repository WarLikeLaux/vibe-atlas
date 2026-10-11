# DeepSeek-V4.1-Flash

## Происхождение

- Карточка: `deepseek-v4-1-flash`.
- Задание: `20261011-model-identity-wave1`.
- Состояние: `source-verified`.
- Проверено: `2026-10-10` (UTC).
- Роль: исследователь идентичности моделей.
- Шаблон: адаптированы «Происхождение» и «Проверка и передача» из benchmark-finding. Числовой тест и мнение неприменимы.
- Доказательства: официальная документация вендора.

## Идентичность и соответствие

- Запрошенное имя: DeepSeek V4.1 Flash.
- Опубликованное имя: DeepSeek-V4.1-Flash.
- Вендор: DeepSeek.
- Вариант: base.
- ID: vendor-api: `deepseek-flash`.
- Дата релиза: 2026-09-10.
- Статус релиза: unknown.
- Актуальность: `current-listed`.
- Решение: `exact-identity`.

## Подтверждённые поля

- `publishedName`: DeepSeek-V4.1-Flash. Источники: [s24](https://api-docs.deepseek.com/quick_start/pricing/), [s25](https://api-docs.deepseek.com/news/news260910/). Проверено `2026-10-10`.
- `identifiers`: [{"namespace": "vendor-api", "value": "deepseek-flash"}]. Источники: [s24](https://api-docs.deepseek.com/quick_start/pricing/), [s25](https://api-docs.deepseek.com/news/news260910/). Проверено `2026-10-10`.
- `availability`: DeepSeek API. legacy deepseek-v4-flash и deepseek-v4-flash-vision-exp перенаправляются на V4.1-Flash.. Источники: [s24](https://api-docs.deepseek.com/quick_start/pricing/), [s25](https://api-docs.deepseek.com/news/news260910/). Проверено `2026-10-10`.
- `currentVersionAssessment`: current-listed. Источники: [s24](https://api-docs.deepseek.com/quick_start/pricing/), [s25](https://api-docs.deepseek.com/news/news260910/). Проверено `2026-10-10`.
- `releaseDate`: 2026-09-10. Источники: [s25](https://api-docs.deepseek.com/news/news260910/). Проверено `2026-10-10`.

## Неизвестное и конфликты

- `releaseStatus`: Точный статус GA/Preview/Stable не установлен.
- `latestInLineage`: Последняя версия каждой отдельной линейки и варианта не доказана одним присутствием в каталоге.
- `benchmarkEffort`: Настройки конкретных замеров не проверялись. Документированный default не подставляется в чужой запуск.

## Проверка и передача

- [DeepSeek Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing/), раздел Model Details / footnote 1. Проверено `2026-10-10`. Дата публикации: unknown. Способ: публичный HTTP 200 через urllib.request, извлечение HTMLParser и чтение основного текста.
- [DeepSeek V4.1 Flash release](https://api-docs.deepseek.com/news/news260910/), раздел API migration / Sept 14. Проверено `2026-10-10`. Дата публикации: 2026-09-10. Способ: публичный HTTP 200 через urllib.request, извлечение HTMLParser и чтение основного текста.
- Дубликаты: альтернативные URL одного оригинала не образуют независимые подтверждения. Журнал: [sources.json](../sources.json).
- Машинная запись: [identity-findings.json](../identity-findings.json), массив `findings`, поиск по ID карточки.
- Следующий шаг: интегратор повторно сверяет оригиналы и открытые вопросы. Исторические результаты не переносятся на новую версию.
