# Qwen3.8 Max (0902)

## Происхождение

- Карточка: `qwen3-8-max`.
- Задание: `20261011-model-identity-wave1`.
- Состояние: `source-verified`.
- Проверено: `2026-10-10` (UTC).
- Роль: исследователь идентичности моделей.
- Шаблон: адаптированы «Происхождение» и «Проверка и передача» из benchmark-finding. Числовой тест и мнение неприменимы.
- Доказательства: официальная документация вендора.

## Идентичность и соответствие

- Запрошенное имя: Qwen3.8 Max (0902).
- Опубликованное имя: qwen3.8-max-0902.
- Вендор: Alibaba.
- Вариант: 0902 snapshot.
- ID: vendor-api: `qwen3.8-max-0902`.
- Дата релиза: unknown.
- Статус релиза: unknown.
- Актуальность: `current-listed`.
- Решение: `exact-identity`.

## Подтверждённые поля

- `publishedName`: qwen3.8-max-0902. Источники: [s29](https://www.alibabacloud.com/help/en/model-studio/model-pricing). Проверено `2026-10-10`.
- `identifiers`: [{"namespace": "vendor-api", "value": "qwen3.8-max-0902"}]. Источники: [s29](https://www.alibabacloud.com/help/en/model-studio/model-pricing). Проверено `2026-10-10`.
- `availability`: Alibaba Cloud Model Studio, строки различают deployment scope.. Источники: [s29](https://www.alibabacloud.com/help/en/model-studio/model-pricing). Проверено `2026-10-10`.
- `currentVersionAssessment`: current-listed. Источники: [s29](https://www.alibabacloud.com/help/en/model-studio/model-pricing). Проверено `2026-10-10`.

## Неизвестное и конфликты

- `rollingAlias`: qwen3.8-max опубликован отдельно. Его равенство snapshot 0902 не доказано. 0902 не преобразуется в дату релиза.
- `releaseDate`: Дата релиза не установлена в прочитанных разделах.
- `releaseStatus`: Точный статус GA/Preview/Stable не установлен.
- `latestInLineage`: Последняя версия каждой отдельной линейки и варианта не доказана одним присутствием в каталоге.
- `benchmarkEffort`: Настройки конкретных замеров не проверялись. Документированный default не подставляется в чужой запуск.

## Проверка и передача

- [Model Studio model pricing](https://www.alibabacloud.com/help/en/model-studio/model-pricing), раздел Qwen-Max / Qwen-Plus / Qwen3.8 / Qwen-Flash. Проверено `2026-10-10`. Дата публикации: unknown. Способ: web.open + сверка соответствующего раздела.
- Дубликаты: альтернативные URL одного оригинала не образуют независимые подтверждения. Журнал: [sources.json](../sources.json).
- Машинная запись: [identity-findings.json](../identity-findings.json), массив `findings`, поиск по ID карточки.
- Следующий шаг: интегратор повторно сверяет оригиналы и открытые вопросы. Исторические результаты не переносятся на новую версию.
