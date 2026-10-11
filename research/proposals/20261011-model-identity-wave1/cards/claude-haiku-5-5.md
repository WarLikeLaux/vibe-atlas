# Claude Haiku 5.5

## Происхождение

- Карточка: `claude-haiku-5-5`.
- Задание: `20261011-model-identity-wave1`.
- Состояние: `source-verified`.
- Проверено: `2026-10-10` (UTC).
- Роль: исследователь идентичности моделей.
- Шаблон: адаптированы «Происхождение» и «Проверка и передача» из benchmark-finding. Числовой тест и мнение неприменимы.
- Доказательства: официальная документация вендора.

## Идентичность и соответствие

- Запрошенное имя: Claude Haiku 5.5.
- Опубликованное имя: Claude Haiku 5.5.
- Вендор: Anthropic.
- Вариант: base.
- ID: vendor-api: `claude-haiku-5-5`.
- Дата релиза: unknown.
- Статус релиза: unknown.
- Актуальность: `current-listed`.
- Решение: `exact-identity`.

## Подтверждённые поля

- `publishedName`: Claude Haiku 5.5. Источники: [s17](https://platform.claude.com/docs/en/models/overview). Проверено `2026-10-10`.
- `identifiers`: [{"namespace": "vendor-api", "value": "claude-haiku-5-5"}]. Источники: [s17](https://platform.claude.com/docs/en/models/overview). Проверено `2026-10-10`.
- `availability`: ID опубликован для Claude API. Доступ Claude Code и ID в Cursor отдельно не сверены.. Источники: [s17](https://platform.claude.com/docs/en/models/overview). Проверено `2026-10-10`.
- `currentVersionAssessment`: current-listed. Источники: [s17](https://platform.claude.com/docs/en/models/overview). Проверено `2026-10-10`.

## Неизвестное и конфликты

- `releaseDate`: Дата релиза не установлена в прочитанных разделах.
- `releaseStatus`: Точный статус GA/Preview/Stable не установлен.
- `latestInLineage`: Последняя версия каждой отдельной линейки и варианта не доказана одним присутствием в каталоге.
- `benchmarkEffort`: Настройки конкретных замеров не проверялись. Документированный default не подставляется в чужой запуск.

## Проверка и передача

- [Claude Models overview](https://platform.claude.com/docs/en/models/overview), раздел Compare models / Model IDs. Проверено `2026-10-10`. Дата публикации: unknown. Способ: web.open + сверка соответствующего раздела.
- Дубликаты: альтернативные URL одного оригинала не образуют независимые подтверждения. Журнал: [sources.json](../sources.json).
- Машинная запись: [identity-findings.json](../identity-findings.json), массив `findings`, поиск по ID карточки.
- Следующий шаг: интегратор повторно сверяет оригиналы и открытые вопросы. Исторические результаты не переносятся на новую версию.
