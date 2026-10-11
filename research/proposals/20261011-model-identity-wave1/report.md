# Проверка идентичности моделей

Партия завершена в заданной границе: открыты 30 первичных URL, содержательные поля сверены по 28 оригиналам. Один URL повторяет Cursor Docs на другом хосте, ещё один вернул только навигацию MiniMax M Plan. Сданы 45 карточек: все 35 позиций существующего каталога и 10 дополнительных предложений. У 33 карточек состояние `source-verified`, у 12 `needs-context`. Для ещё 6 первичных материалов сохранён `candidate`: найдены в поиске, оригиналы не прочитаны.

Дата фактической проверки: `2026-10-10` по UTC. Дата в имени задания не использована вместо показания часов. Начало и завершение проверки находятся в `identity-findings.json`. Даты публикации, даты релиза и дата проверки сохраняются раздельно. У динамической документации неизвестная дата публикации остаётся `null`.

## Материалы передачи

- [identity-findings.json](identity-findings.json): запрошенное и опубликованное имя, вариант, ID с пространством имён, даты, подтверждённые поля, неизвестное, конфликты и предложения по соответствию.
- [sources.json](sources.json): 30 открытых URL с разделами сверки, редиректами, ошибками доступа и дубликатом. Отдельный массив содержит 6 непрочитанных кандидатов.
- [cards/](cards/): отдельная Markdown-карточка для каждой записи. Карточки адаптируют происхождение и передачу из шаблона `docs/templates/benchmark-finding.md`, числовые тесты и мнения здесь неприменимы.

Статус `source-verified` относится к перечисленным подтверждённым полям. Он не означает, что известны все даты релиза, что выполнен API-запрос или что текущий rolling ID доказывает snapshot исторического замера. `ready-for-integration` не назначался: отдельная сверка интегратором ещё не выполнена.

## Основной набор и близкие варианты

| Запрошенная позиция        | Сверенное соответствие                  | Ограничение                                                               |
| -------------------------- | --------------------------------------- | ------------------------------------------------------------------------- |
| GPT-6.1 Luna               | Подтверждение точной версии не найдено  | Отдельно подтверждена GPT-6 Luna, `gpt-6-luna`. Версии не объединять      |
| GPT-6.1 Sol                | `gpt-6.1-sol`                           | Релиз 2026-09-29, доступ Codex зависит от rollout                         |
| GPT-6 Astra                | `gpt-6-astra`                           | Релиз 2026-09-03, доступ инструмента проверен отдельно от API             |
| GLM-5.3                    | `glm-5.3`                               | Доступ через GLM Coding Plan опубликован                                  |
| GLM-5.3-Flash              | `glm-5.3-flash`                         | FlashX имеет другой ID и пока не входит в Coding Plan                     |
| Composer 2.5               | `composer-2.5` в Cursor                 | Это инструментальный ID. Отдельный публичный API вендора не предполагался |
| Grok 4.7 через Cursor Pro  | `grok-4.7`, Cursor Models включён в Pro | Fast, effort и контекст сохраняются как настройки                         |
| Gemini 3.8 Flash           | `gemini-3.8-flash`                      | GA-релиз 2026-09-02. Версия также перечислена в Cursor                    |
| MiniMax-M3.1-Flash-Preview | `MiniMax-M3.1-Flash-Preview`            | Только M Plan и MiniMax Code, общий pay-as-you-go доступ не подтверждён   |
| Muse Spark 1.3 Contributor | `muse-spark-1.3-contributor`            | Отдельный tier с разрешением на обучение. Max указан только для Standard  |
| MiniMax-M3                 | `MiniMax-M3`                            | Самостоятельная запись, результаты не переносить на Flash Preview         |
| Muse Spark 1.3             | `muse-spark-1.3`                        | Standard отделён от Contributor                                           |

Источник и дата каждой строки раскрыты в соответствующей карточке и массиве `confirmed` машинного файла. Три ранее помеченные `requested-unconfirmed` позиции рассмотрены отдельно: две получили опубликованные ID, GPT-6.1 Luna сохранила неизвестность. Общий каталог не изменён.

## Существенные различия и конфликты

Luna 6.1 не найдена в прочитанных каталогах OpenAI и журнале изменений. Проверка подтверждает Luna 6, а также раздельные Sol и Astra. Это ограниченный отрицательный результат, не заявление об отсутствии модели во всех продуктах. [API Models](https://developers.openai.com/api/docs/models), [модели Codex](https://learn.chatgpt.com/docs/models), проверено `2026-10-10`.

FlashX требует отдельной записи и не наследует доступ Flash в Coding Plan. [Z.AI Flash/FlashX](https://docs.z.ai/guides/vlm/glm-5.3-flash), проверено `2026-10-10`. Contributor сохраняется отдельно от Standard. [Meta Models](https://dev.meta.ai/docs/models), проверено `2026-10-10`.

У DeepSeek обнаружен конфликт первичных страниц. Тарифная таблица продолжает связывать `deepseek-v4-pro` с V4-Pro-0813, а анонс V4.1-Flash объявляет перенаправление этого ID с 2026-09-14 04:00 UTC. Запись Pro требует сверки фактического обслуживания API. Для V4.1-Flash вендор публикует ID `deepseek-flash`. Сопоставление имени AA «DeepSeek V4 Flash Vision» с retired «V4-Flash-Vision-Exp» не доказано. [Таблица моделей](https://api-docs.deepseek.com/quick_start/pricing/), [анонс и миграция](https://api-docs.deepseek.com/news/news260910/), проверено `2026-10-10`.

Kimi Code сообщает, что `kimi-for-coding` обновлён на K2.8 Preview. K3 использует `k3`, контекстный вариант использует `k3-256k`, HighSpeed использует `kimi-for-coding-highspeed`. Это пространство ID Kimi Code. ID Moonshot API отдельно не проверены. Старая K2.7 Code не получает результаты K2.8 Preview. [Kimi Code Models](https://www.kimi.com/en/help/kimi-code/models), проверено `2026-10-10`.

Для Qwen Max сохранён конкретный `qwen3.8-max-0902`. Публикация рядом rolling ID `qwen3.8-max` не доказывает их эквивалентность. Текущая эквивалентность Plus с `qwen3.7-plus-2026-05-26` указана в документации, но snapshot замера AA этой партией не установлен. Flash не подставлен вместо Flash Next. [Model Studio pricing](https://www.alibabacloud.com/help/en/model-studio/model-pricing), проверено `2026-10-10`.

Muse Glimmer подтверждён как модель для самостоятельного обслуживания. Конкретные веса, размер и ревизия измерения AA неизвестны. API ID Meta к этой записи не применяется. [Meta Models](https://dev.meta.ai/docs/models), проверено `2026-10-10`.

Step 5 Preview подтверждён по названию и статусу Preview. Первичная страница использует `YOUR_MODEL_ID` в примере, поэтому `step-5` из AA не превращён в официальный API ID. [StepFun Open Platform](https://platform.stepfun.ai/), проверено `2026-10-10`.

## Сверка с текущей основой и дубликаты

Прочитаны `data/model-catalog.json`, `data/sources.json`, `data/aa-models.json`, `data/artificial-analysis.json`, `data/cursor-benchmarks.json` и `data/terminal-bench-definition.json`. Это локальная основа соответствий, а не дополнительное подтверждение вендорского API ID. Сохранены существующие `sources`, `evidence` и исходные имена AA/Cursor в каждой записи. Effort, fallback, Fast и другие суффиксы исходных названий не удалены из `existingImportLabels`.

Документация не повторяет импорт бенчмарков. Числовые результаты, цены, квоты и мнения не собраны в этой партии. Зарегистрированные MiniMax, OpenAI Codex и Cursor источники связаны с проверенными документами, новые оригиналы не внесены в общий реестр. `https://cursor.com/docs/models-and-pricing` повторяет `https://prod.cursor.com/docs/models-and-pricing` и обозначен `duplicate`. Две версии Meta Spark, Flash и FlashX, M3 и Flash Preview не считаются дубликатами.

## Проверенные оригиналы

В таблице дата проверки для всех `source-verified` и `duplicate`: `2026-10-10`. Для `needs-context` есть только дата получения, успешная проверка условий отсутствует. Повторное чтение разделов того же URL не увеличивает число материалов. Автоматические редиректы также не считаются новыми материалами.

| ID  | Оригинал                                                                                      | Проверенный раздел                          | Состояние         |
| --- | --------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------- |
| s01 | [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna)                        | Snapshots                                   | `source-verified` |
| s02 | [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol)                      | Snapshots                                   | `source-verified` |
| s03 | [GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra)                      | Snapshots                                   | `source-verified` |
| s04 | [Модели ChatGPT и Codex](https://learn.chatgpt.com/docs/models)                               | Recommended models / GPT-6.1 Sol            | `source-verified` |
| s05 | [GLM-5.3](https://docs.z.ai/guides/llm/glm-5.3)                                               | Overview / Feature Changes / How to Use     | `source-verified` |
| s06 | [GLM-5.3-Flash/FlashX](https://docs.z.ai/guides/vlm/glm-5.3-flash)                            | Model API / GLM Coding Plan                 | `source-verified` |
| s07 | [Meta Model API Models](https://dev.meta.ai/docs/models)                                      | Muse Spark / Tiers / Muse Glimmer           | `source-verified` |
| s08 | [MiniMax Flash Preview guide](https://agent.minimax.io/tools/m3-1-flash-preview)              | How to Start / API integrations             | `source-verified` |
| s09 | [MiniMax M Plan](https://www.minimax.io/m-plan)                                               | Полученный HTML                             | `needs-context`   |
| s10 | [Cursor Models & Pricing](https://prod.cursor.com/docs/models-and-pricing)                    | Usage pools / Plans / Other Models          | `source-verified` |
| s11 | [Cursor Grok 4.7](https://prod.cursor.com/docs/models/grok-4-7)                               | Model ID / Effort levels                    | `source-verified` |
| s12 | [OpenAI Models](https://developers.openai.com/api/docs/models)                                | Flagship models                             | `source-verified` |
| s13 | [OpenAI API Changelog](https://developers.openai.com/api/docs/changelog)                      | Jul 9 / Sep 3 / Sep 22 / Sep 29, 2026       | `source-verified` |
| s14 | [Cursor Composer](https://cursor.com/composer)                                                | Announcements / FAQ                         | `source-verified` |
| s15 | [Gemini API Models](https://ai.google.dev/gemini-api/docs/models)                             | All Gemini 3 models                         | `source-verified` |
| s16 | [SpaceXAI Models](https://docs.x.ai/developers/models)                                        | Meet grok-4.7                               | `source-verified` |
| s17 | [Claude Models overview](https://platform.claude.com/docs/en/models/overview)                 | Compare models / Model IDs                  | `source-verified` |
| s18 | [Model Studio Models](https://www.alibabacloud.com/help/en/model-studio/models)               | Text generation / Understanding / Omni      | `source-verified` |
| s19 | [Gemini 3.8 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash)             | Model code                                  | `source-verified` |
| s20 | [Gemini API Release notes](https://ai.google.dev/gemini-api/docs/changelog)                   | September 2, 2026                           | `source-verified` |
| s21 | [MiniMax Models](https://platform.minimax.io/docs/guides/models-intro)                        | Language / Legacy Models                    | `source-verified` |
| s22 | [Cursor Models & Pricing, второй хост](https://cursor.com/docs/models-and-pricing)            | Usage pools / Plans                         | `duplicate`       |
| s23 | [Cursor Composer 2.5 model](https://prod.cursor.com/docs/models/cursor-composer-2-5)          | Model ID                                    | `source-verified` |
| s24 | [DeepSeek Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing/)               | Model Details / footnote 1                  | `source-verified` |
| s25 | [DeepSeek V4.1 Flash release](https://api-docs.deepseek.com/news/news260910/)                 | API migration / Sept 14                     | `source-verified` |
| s26 | [Kimi Code Model Configuration](https://www.kimi.com/en/help/kimi-code/models)                | Model Overview / Recommended model launch   | `source-verified` |
| s27 | [GPT-5.6 Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra)                  | Snapshots                                   | `source-verified` |
| s28 | [StepFun Open Platform](https://platform.stepfun.ai/)                                         | Models overview / API example               | `source-verified` |
| s29 | [Model Studio model pricing](https://www.alibabacloud.com/help/en/model-studio/model-pricing) | Qwen-Max / Qwen-Plus / Qwen3.8 / Qwen-Flash | `source-verified` |
| s30 | [MiniMax Anthropic SDK](https://platform.minimax.io/docs/api-reference/text-anthropic-api)    | Supported Models / Thinking Control         | `source-verified` |

## Карточки

| Запись                                                                      | Состояние         | Подтверждённые ID            |
| --------------------------------------------------------------------------- | ----------------- | ---------------------------- |
| [GPT-6.1 Sol](cards/gpt-6-1-sol.md)                                         | `source-verified` | `gpt-6.1-sol`                |
| [GPT-6 Luna](cards/gpt-6-luna.md)                                           | `source-verified` | `gpt-6-luna`                 |
| [GPT-6 Astra](cards/gpt-6-astra.md)                                         | `source-verified` | `gpt-6-astra`                |
| [GPT-5.6 Terra](cards/gpt-5-6-terra.md)                                     | `source-verified` | `gpt-5.6-terra`              |
| [Claude Opus 5.5](cards/claude-opus-5-5.md)                                 | `source-verified` | `claude-opus-5-5`            |
| [Claude Sonnet 5.5](cards/claude-sonnet-5-5.md)                             | `source-verified` | `claude-sonnet-5-5`          |
| [Claude Haiku 5.5](cards/claude-haiku-5-5.md)                               | `source-verified` | `claude-haiku-5-5`           |
| [Claude Fable 5.1](cards/claude-fable-5-1.md)                               | `source-verified` | `claude-fable-5-1`           |
| [GLM-5.3](cards/glm-5-3.md)                                                 | `source-verified` | `glm-5.3`                    |
| [GLM-5.3-Flash](cards/glm-5-3-flash.md)                                     | `source-verified` | `glm-5.3-flash`              |
| [Composer 2.5](cards/composer-2-5.md)                                       | `source-verified` | `composer-2.5`               |
| [Grok 4.7](cards/grok-4-7.md)                                               | `source-verified` | `grok-4.7`                   |
| [Gemini 3.8 Flash](cards/gemini-3-8-flash.md)                               | `source-verified` | `gemini-3.8-flash`           |
| [Gemini 4 Argon](cards/gemini-4-argon.md)                                   | `needs-context`   | unknown                      |
| [Gemini 3.5 Flash-Lite](cards/gemini-3-5-flash-lite.md)                     | `source-verified` | `gemini-3.5-flash-lite`      |
| [Gemini 3.1 Pro](cards/gemini-3-1-pro-preview.md)                           | `source-verified` | `gemini-3.1-pro-preview`     |
| [Gemini 3 Deep Think](cards/gemini-3-deep-think.md)                         | `needs-context`   | unknown                      |
| [MiniMax-M3](cards/minimax-m3.md)                                           | `source-verified` | `MiniMax-M3`                 |
| [Muse Spark 1.3](cards/muse-spark-1-3.md)                                   | `source-verified` | `muse-spark-1.3`             |
| [Muse Glimmer](cards/muse-glimmer.md)                                       | `needs-context`   | unknown                      |
| [Qwen3.8 Max (0902)](cards/qwen3-8-max.md)                                  | `source-verified` | `qwen3.8-max-0902`           |
| [Qwen3.8-Flash-Next](cards/qwen3-8-flash-next.md)                           | `needs-context`   | unknown                      |
| [Qwen3.7 Plus](cards/qwen3-7-plus.md)                                       | `source-verified` | `qwen3.7-plus`               |
| [Qwen3 Coder Next](cards/qwen3-coder-next.md)                               | `needs-context`   | unknown                      |
| [Qwen3.8 27B](cards/qwen3-8-27b.md)                                         | `source-verified` | `qwen3.8-27b`                |
| [Qwen3.8 2.4T A95B](cards/qwen3-8-2-4t-a95b.md)                             | `source-verified` | `qwen3.8-2.4t-a95b`          |
| [DeepSeek-V4.1-Flash](cards/deepseek-v4-1-flash.md)                         | `source-verified` | `deepseek-flash`             |
| [DeepSeek-V4-Pro-0813](cards/deepseek-v4-pro.md)                            | `needs-context`   | `deepseek-v4-pro`            |
| [DeepSeek V4 Flash Vision](cards/deepseek-v4-flash-vision.md)               | `needs-context`   | unknown                      |
| [K3](cards/kimi-k3.md)                                                      | `source-verified` | `k3`                         |
| [Kimi K2.7 Code](cards/kimi-k2-7-code.md)                                   | `needs-context`   | unknown                      |
| [Step 5 Preview](cards/step-5.md)                                           | `needs-context`   | unknown                      |
| [GPT-6.1 Luna](cards/gpt-6-1-luna-requested.md)                             | `needs-context`   | unknown                      |
| [MiniMax-M3.1-Flash-Preview](cards/minimax-m3-1-flash-preview-requested.md) | `source-verified` | `MiniMax-M3.1-Flash-Preview` |
| [Muse Spark 1.3 Contributor](cards/muse-spark-1-3-contributor-requested.md) | `source-verified` | `muse-spark-1.3-contributor` |
| [GLM-5.3-FlashX](cards/glm-5-3-flashx-proposed.md)                          | `source-verified` | `glm-5.3-flashx`             |
| [MiniMax-M2.7](cards/minimax-m2-7-proposed.md)                              | `source-verified` | `MiniMax-M2.7`               |
| [MiniMax-M2.7-highspeed](cards/minimax-m2-7-highspeed-proposed.md)          | `source-verified` | `MiniMax-M2.7-highspeed`     |
| [qwen3.8-flash](cards/qwen3-8-flash-proposed.md)                            | `source-verified` | `qwen3.8-flash`              |
| [qwen3.8-omni-flash](cards/qwen3-8-omni-flash-proposed.md)                  | `source-verified` | `qwen3.8-omni-flash`         |
| [K2.8 Preview](cards/kimi-k2-8-preview-proposed.md)                         | `source-verified` | `kimi-for-coding`            |
| [K3](cards/kimi-k3-256k-proposed.md)                                        | `source-verified` | `k3-256k`                    |
| [K2.7 Code HighSpeed](cards/kimi-k2-7-code-highspeed-proposed.md)           | `source-verified` | `kimi-for-coding-highspeed`  |
| [Step 3.7 Flash](cards/step-3-7-flash-proposed.md)                          | `needs-context`   | unknown                      |
| [Step 3.5 Flash](cards/step-3-5-flash-proposed.md)                          | `needs-context`   | unknown                      |

## Поиск и ограничения доступа

Поиск начинался с точных пользовательских названий в официальных доменах. Далее проверены каталоги, журнал релизов, отдельные страницы вариантов и доступ в инструментах. Для OpenAI применены official-domain search и прочитанные документы `developers.openai.com` и `learn.chatgpt.com`. Для остальных использованы Z.AI, Meta, MiniMax, Cursor, Google AI, SpaceXAI, Claude Platform, Alibaba Cloud, DeepSeek, Kimi и StepFun.

Запросы по дополнительному охвату включали Terra, четыре линейки Claude, Qwen Max/Plus/Flash Next/Coder Next/27B/2.4T A95B, DeepSeek Flash/Pro/Vision, Kimi K3/K2.7 Code, Step 5 Preview, Gemini Argon и Deep Think. Наличие полезных кандидатов не остановило поиск остальных линеек. По достижении 30 открытых первичных URL новые страницы не открывались.

`web.open` не смог получить две страницы DeepSeek из-за timeout и страницу Kimi Models из-за недоступности в инструменте. Все три оригинала затем прочитаны по публичному HTTP 200 через `urllib.request` без авторизации. Основной текст извлечён через `HTMLParser`. Это полноценная сверка оригинала, а не подтверждение по сниппету.

MiniMax M Plan вернул только навигацию и через web, и через публичный HTTP. Сниппет с утверждением про три плана не использован. Доступ Flash Preview установлен по двум содержательным документам MiniMax. Полные цены, лимиты и условия каждого M Plan остаются неизвестными.

Поисковые результаты с рекламными параметрами, идентификаторами проектов или команд заменены чистыми публичными URL. Полные HTML-ответы не сохранялись. В пакете находятся извлечённые поля и короткие пересказы, без приватных учётных данных и контекста инструмента.

## Неизвестное и оставшаяся работа

Конечная партия завершена, полный аудит каталога не заявляется. Общая актуальность всех конкретных линеек, полные условия доступа и история snapshots требуют продолжения. Следующая сверка должна открыть найденные кандидаты, сохраняя их статус до чтения оригинала:

- [Qwen3.8-Flash-Next](https://www.alibabacloud.com/blog/qwen3-8-flash-next-a-new-architecture-towardsultimate-cost-efficiency_603501), `c01`, `candidate`.
- [Qwen3 Coder Next](https://www.alibabacloud.com/help/en/model-studio/qwen3-coder-next), `c02`, `candidate`.
- [Gemini 4 Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/), `c03`, `candidate`.
- [Gemini 3 Deep Think, исходный релиз](https://blog.google/products-and-platforms/products/gemini/gemini-3-deep-think/), `c04`, `candidate`.
- [Gemini 3.1 Deep Think, возможное обновление отдельной линейки](https://deepmind.google/models/gemini/deep-think/), `c05`, `candidate`.
- [Публикация Muse Spark 1.3](https://ai.meta.com/events/), `c06`, `candidate`.

Для Argon найден официальный анонс, для Deep Think найдены две версии названия. Их отсутствие в API-каталоге не означает отсутствия в других продуктах. Flash Next и Coder Next имеют первичные кандидаты, имена и API ID пока не признаны проверенными. По Muse Spark 1.3 дата анонса из выдачи не подставлена вместо прочитанного источника.

Дополнительные предложения включают FlashX, MiniMax M2.7 и highspeed, Qwen Flash и Omni Flash, Kimi K2.8 Preview, K3 256K и K2.7 Code HighSpeed, Step 3.7 Flash и Step 3.5 Flash. Они не заменяют основной набор. Включение Omni в coding-каталог и принадлежность двух поколений Step Flash отдельным значимым вариантам требуют редакционного решения. Дальше следует отдельно сверить варианты Glimmer и Moonshot API, даты релизов, текущий DeepSeek Pro и конфигурации измерений.

## Проверка файлов

Проверены JSON, уникальность карточек, охват всех 35 записей каталога, ссылки на источники, состояния и отсутствие приватных полей. Форматирование и Markdown-проверка выполняются только для файлов этой папки. Интеграция, изменение интерфейса, commit, push и публикация не выполнялись. Общий `npm run check` не запускается, поскольку сборка пишет файлы вне разрешённой папки.
