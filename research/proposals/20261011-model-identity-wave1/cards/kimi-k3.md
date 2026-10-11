# K3

## Происхождение

- Карточка: `kimi-k3`.
- Задание: `20261011-model-identity-wave1`.
- Состояние: `source-verified`.
- Проверено: `2026-10-10` (UTC).
- Роль: исследователь идентичности моделей.
- Шаблон: адаптированы «Происхождение» и «Проверка и передача» из benchmark-finding. Числовой тест и мнение неприменимы.
- Доказательства: официальная документация вендора.

## Идентичность и соответствие

- Запрошенное имя: Kimi K3.
- Опубликованное имя: K3.
- Вендор: Kimi.
- Вариант: base.
- ID: kimi-code-model-id: `k3`.
- Дата релиза: unknown.
- Статус релиза: unknown.
- Актуальность: `current-listed`.
- Решение: `exact-identity`.

## Подтверждённые поля

- `publishedName`: K3. Источники: [s26](https://www.kimi.com/en/help/kimi-code/models). Проверено `2026-10-10`.
- `identifiers`: [{"namespace": "kimi-code-model-id", "value": "k3"}]. Источники: [s26](https://www.kimi.com/en/help/kimi-code/models). Проверено `2026-10-10`.
- `availability`: Kimi Code. k3-256k является отдельным контекстным вариантом. 1M зависит от плана.. Источники: [s26](https://www.kimi.com/en/help/kimi-code/models). Проверено `2026-10-10`.
- `currentVersionAssessment`: current-listed. Источники: [s26](https://www.kimi.com/en/help/kimi-code/models). Проверено `2026-10-10`.

## Неизвестное и конфликты

- `providerNamespace`: Это ID Kimi Code, не установленный ID Moonshot API или snapshot замера AA.
- `releaseDate`: Дата релиза не установлена в прочитанных разделах.
- `releaseStatus`: Точный статус GA/Preview/Stable не установлен.
- `latestInLineage`: Последняя версия каждой отдельной линейки и варианта не доказана одним присутствием в каталоге.
- `benchmarkEffort`: Настройки конкретных замеров не проверялись. Документированный default не подставляется в чужой запуск.

## Проверка и передача

- [Kimi Code Model Configuration](https://www.kimi.com/en/help/kimi-code/models), раздел Model Overview / Recommended model launch. Проверено `2026-10-10`. Дата публикации: unknown. Способ: публичный HTTP 200 через urllib.request, извлечение HTMLParser и чтение основного текста.
- Дубликаты: альтернативные URL одного оригинала не образуют независимые подтверждения. Журнал: [sources.json](../sources.json).
- Машинная запись: [identity-findings.json](../identity-findings.json), массив `findings`, поиск по ID карточки.
- Следующий шаг: интегратор повторно сверяет оригиналы и открытые вопросы. Исторические результаты не переносятся на новую версию.
