# DeepSeek-V4-Pro-0813

## Происхождение

- Карточка: `deepseek-v4-pro`.
- Задание: `20261011-model-identity-wave1`.
- Состояние: `needs-context`.
- Проверено: `2026-10-10` (UTC).
- Роль: исследователь идентичности моделей.
- Шаблон: адаптированы «Происхождение» и «Проверка и передача» из benchmark-finding. Числовой тест и мнение неприменимы.
- Доказательства: официальная документация вендора.

## Идентичность и соответствие

- Запрошенное имя: DeepSeek V4 Pro 0813.
- Опубликованное имя: DeepSeek-V4-Pro-0813.
- Вендор: DeepSeek.
- Вариант: 0813.
- ID: vendor-api: `deepseek-v4-pro`.
- Дата релиза: unknown.
- Статус релиза: unknown.
- Актуальность: `conflicting-vendor-documents`.
- Решение: `review-conflict`.

## Подтверждённые поля

- `publishedName`: DeepSeek-V4-Pro-0813. Источники: [s24](https://api-docs.deepseek.com/quick_start/pricing/), [s25](https://api-docs.deepseek.com/news/news260910/). Проверено `2026-10-10`.
- `identifiers`: [{"namespace": "vendor-api", "value": "deepseek-v4-pro"}]. Источники: [s24](https://api-docs.deepseek.com/quick_start/pricing/), [s25](https://api-docs.deepseek.com/news/news260910/). Проверено `2026-10-10`.
- `availability`: Таблица сохраняет V4-Pro-0813, а анонс объявляет перенаправление ID с 2026-09-14 04:00 UTC.. Источники: [s24](https://api-docs.deepseek.com/quick_start/pricing/), [s25](https://api-docs.deepseek.com/news/news260910/). Проверено `2026-10-10`.
- `currentVersionAssessment`: conflicting-vendor-documents. Источники: [s24](https://api-docs.deepseek.com/quick_start/pricing/), [s25](https://api-docs.deepseek.com/news/news260910/). Проверено `2026-10-10`.

## Неизвестное и конфликты

- `releaseDate`: Дата релиза не установлена в прочитанных разделах.
- `releaseStatus`: Точный статус GA/Preview/Stable не установлен.
- `benchmarkEffort`: Настройки конкретных замеров не проверялись. Документированный default не подставляется в чужой запуск.
- Конфликт: s24 связывает deepseek-v4-pro с V4-Pro-0813. s25 объявляет обслуживание этого ID моделью V4.1-Flash. Исторический балл Pro нельзя переносить на Flash.

## Проверка и передача

- [DeepSeek Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing/), раздел Model Details / footnote 1. Проверено `2026-10-10`. Дата публикации: unknown. Способ: публичный HTTP 200 через urllib.request, извлечение HTMLParser и чтение основного текста.
- [DeepSeek V4.1 Flash release](https://api-docs.deepseek.com/news/news260910/), раздел API migration / Sept 14. Проверено `2026-10-10`. Дата публикации: 2026-09-10. Способ: публичный HTTP 200 через urllib.request, извлечение HTMLParser и чтение основного текста.
- Дубликаты: альтернативные URL одного оригинала не образуют независимые подтверждения. Журнал: [sources.json](../sources.json).
- Машинная запись: [identity-findings.json](../identity-findings.json), массив `findings`, поиск по ID карточки.
- Следующий шаг: интегратор повторно сверяет оригиналы и открытые вопросы. Исторические результаты не переносятся на новую версию.
