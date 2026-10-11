# MiniMax-M2.7

## Происхождение

- Карточка: `minimax-m2-7-proposed`.
- Задание: `20261011-model-identity-wave1`.
- Состояние: `source-verified`.
- Проверено: `2026-10-10` (UTC).
- Роль: исследователь идентичности моделей.
- Шаблон: адаптированы «Происхождение» и «Проверка и передача» из benchmark-finding. Числовой тест и мнение неприменимы.
- Доказательства: официальная документация вендора.

## Идентичность и соответствие

- Запрошенное имя: дополнительное предложение.
- Опубликованное имя: MiniMax-M2.7.
- Вендор: MiniMax.
- Вариант: base.
- ID: vendor-api: `MiniMax-M2.7`.
- Дата релиза: unknown.
- Статус релиза: unknown.
- Актуальность: `current-listed`.
- Решение: `exact-identity`.

## Подтверждённые поля

- `publishedName`: MiniMax-M2.7. Источники: [s21](https://platform.minimax.io/docs/guides/models-intro), [s30](https://platform.minimax.io/docs/api-reference/text-anthropic-api). Проверено `2026-10-10`.
- `identifiers`: [{"namespace": "vendor-api", "value": "MiniMax-M2.7"}]. Источники: [s21](https://platform.minimax.io/docs/guides/models-intro), [s30](https://platform.minimax.io/docs/api-reference/text-anthropic-api). Проверено `2026-10-10`.
- `availability`: Текущий список MiniMax API, отдельно от Legacy Models.. Источники: [s21](https://platform.minimax.io/docs/guides/models-intro), [s30](https://platform.minimax.io/docs/api-reference/text-anthropic-api). Проверено `2026-10-10`.
- `currentVersionAssessment`: current-listed. Источники: [s21](https://platform.minimax.io/docs/guides/models-intro), [s30](https://platform.minimax.io/docs/api-reference/text-anthropic-api). Проверено `2026-10-10`.

## Неизвестное и конфликты

- `releaseDate`: Дата релиза не установлена в прочитанных разделах.
- `releaseStatus`: Точный статус GA/Preview/Stable не установлен.
- `latestInLineage`: Последняя версия каждой отдельной линейки и варианта не доказана одним присутствием в каталоге.
- `benchmarkEffort`: Настройки конкретных замеров не проверялись. Документированный default не подставляется в чужой запуск.

## Проверка и передача

- [MiniMax Models](https://platform.minimax.io/docs/guides/models-intro), раздел Language / Legacy Models. Проверено `2026-10-10`. Дата публикации: unknown. Способ: web.open + сверка соответствующего раздела.
- [MiniMax Anthropic SDK](https://platform.minimax.io/docs/api-reference/text-anthropic-api), раздел Supported Models / Thinking Control. Проверено `2026-10-10`. Дата публикации: unknown. Способ: web.open + сверка соответствующего раздела.
- Дубликаты: альтернативные URL одного оригинала не образуют независимые подтверждения. Журнал: [sources.json](../sources.json).
- Машинная запись: [identity-findings.json](../identity-findings.json), массив `findings`, поиск по ID карточки.
- Следующий шаг: интегратор повторно сверяет оригиналы и открытые вопросы. Исторические результаты не переносятся на новую версию.
