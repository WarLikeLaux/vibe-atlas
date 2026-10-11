# qwen3.8-omni-flash

## Происхождение

- Карточка: `qwen3-8-omni-flash-proposed`.
- Задание: `20261011-model-identity-wave1`.
- Состояние: `source-verified`.
- Проверено: `2026-10-10` (UTC).
- Роль: исследователь идентичности моделей.
- Шаблон: адаптированы «Происхождение» и «Проверка и передача» из benchmark-finding. Числовой тест и мнение неприменимы.
- Доказательства: официальная документация вендора.

## Идентичность и соответствие

- Запрошенное имя: дополнительное предложение.
- Опубликованное имя: qwen3.8-omni-flash.
- Вендор: Alibaba.
- Вариант: Omni Flash.
- ID: vendor-api: `qwen3.8-omni-flash`.
- Дата релиза: unknown.
- Статус релиза: unknown.
- Актуальность: `current-listed`.
- Решение: `exact-identity`.

## Подтверждённые поля

- `publishedName`: qwen3.8-omni-flash. Источники: [s18](https://www.alibabacloud.com/help/en/model-studio/models). Проверено `2026-10-10`.
- `identifiers`: [{"namespace": "vendor-api", "value": "qwen3.8-omni-flash"}]. Источники: [s18](https://www.alibabacloud.com/help/en/model-studio/models). Проверено `2026-10-10`.
- `availability`: Alibaba Cloud Model Studio. Уместность в coding-каталоге требует редакционного решения.. Источники: [s18](https://www.alibabacloud.com/help/en/model-studio/models). Проверено `2026-10-10`.
- `currentVersionAssessment`: current-listed. Источники: [s18](https://www.alibabacloud.com/help/en/model-studio/models). Проверено `2026-10-10`.

## Неизвестное и конфликты

- `releaseDate`: Дата релиза не установлена в прочитанных разделах.
- `releaseStatus`: Точный статус GA/Preview/Stable не установлен.
- `latestInLineage`: Последняя версия каждой отдельной линейки и варианта не доказана одним присутствием в каталоге.
- `benchmarkEffort`: Настройки конкретных замеров не проверялись. Документированный default не подставляется в чужой запуск.

## Проверка и передача

- [Model Studio Models](https://www.alibabacloud.com/help/en/model-studio/models), раздел Text generation / Understanding / Omni. Проверено `2026-10-10`. Дата публикации: unknown. Способ: web.open + сверка соответствующего раздела.
- Дубликаты: альтернативные URL одного оригинала не образуют независимые подтверждения. Журнал: [sources.json](../sources.json).
- Машинная запись: [identity-findings.json](../identity-findings.json), массив `findings`, поиск по ID карточки.
- Следующий шаг: интегратор повторно сверяет оригиналы и открытые вопросы. Исторические результаты не переносятся на новую версию.
