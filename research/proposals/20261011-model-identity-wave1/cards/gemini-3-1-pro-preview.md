# Gemini 3.1 Pro

## Происхождение

- Карточка: `gemini-3-1-pro-preview`.
- Задание: `20261011-model-identity-wave1`.
- Состояние: `source-verified`.
- Проверено: `2026-10-10` (UTC).
- Роль: исследователь идентичности моделей.
- Шаблон: адаптированы «Происхождение» и «Проверка и передача» из benchmark-finding. Числовой тест и мнение неприменимы.
- Доказательства: официальная документация вендора.

## Идентичность и соответствие

- Запрошенное имя: Gemini 3.1 Pro Preview.
- Опубликованное имя: Gemini 3.1 Pro.
- Вендор: Google.
- Вариант: Preview.
- ID: vendor-api: `gemini-3.1-pro-preview`.
- Дата релиза: unknown.
- Статус релиза: Preview.
- Актуальность: `current-listed`.
- Решение: `exact-identity`.

## Подтверждённые поля

- `publishedName`: Gemini 3.1 Pro. Источники: [s15](https://ai.google.dev/gemini-api/docs/models). Проверено `2026-10-10`.
- `identifiers`: [{"namespace": "vendor-api", "value": "gemini-3.1-pro-preview"}]. Источники: [s15](https://ai.google.dev/gemini-api/docs/models). Проверено `2026-10-10`.
- `availability`: Gemini API.. Источники: [s15](https://ai.google.dev/gemini-api/docs/models). Проверено `2026-10-10`.
- `currentVersionAssessment`: current-listed. Источники: [s15](https://ai.google.dev/gemini-api/docs/models). Проверено `2026-10-10`.
- `releaseStatus`: Preview. Источники: [s15](https://ai.google.dev/gemini-api/docs/models). Проверено `2026-10-10`.

## Неизвестное и конфликты

- `nameMapping`: Вендор публикует имя Gemini 3.1 Pro, отдельную метку Preview и ID с preview. Каталог проекта сохраняет Preview в имени.
- `releaseDate`: Дата релиза не установлена в прочитанных разделах.
- `latestInLineage`: Последняя версия каждой отдельной линейки и варианта не доказана одним присутствием в каталоге.
- `benchmarkEffort`: Настройки конкретных замеров не проверялись. Документированный default не подставляется в чужой запуск.

## Проверка и передача

- [Gemini API Models](https://ai.google.dev/gemini-api/docs/models), раздел All Gemini 3 models. Проверено `2026-10-10`. Дата публикации: unknown. Способ: web.open + сверка соответствующего раздела.
- Дубликаты: альтернативные URL одного оригинала не образуют независимые подтверждения. Журнал: [sources.json](../sources.json).
- Машинная запись: [identity-findings.json](../identity-findings.json), массив `findings`, поиск по ID карточки.
- Следующий шаг: интегратор повторно сверяет оригиналы и открытые вопросы. Исторические результаты не переносятся на новую версию.
