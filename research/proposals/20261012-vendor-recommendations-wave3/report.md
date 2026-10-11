# Отчёт 20261012-vendor-recommendations-wave3

## Просмотренные источники

- <https://developers.openai.com/api/docs/models/gpt-6.1-sol> (fetch, ok)
- <https://developers.openai.com/api/docs/models/gpt-6-astra> (fetch, ok)
- <https://docs.z.ai/guides/llm/glm-5.3> (поиск-выдержка, ok)
- <https://z.ai/blog/glm-5.3> (2026-08-14, выдержка, ok)
- <https://docs.z.ai/guides/vlm/glm-5.3-flash> (выдержка, ok)
- <https://docs.z.ai/devpack/notice/event-glm-5.3-flash> (выдержка, ok)
- <https://cursor.com/composer> (выдержка, ok)
- <https://cursor.com/blog/composer-2-5> (2026-05-18, выдержка, ok)
- <https://cursor.com/docs/models/cursor-composer-2-5> (выдержка, ok)
- <https://docs.x.ai/developers/models> (выдержка, ok)
- <https://docs.x.ai/developers/grok-4-7> (выдержка, ok)
- <https://docs.x.ai/developers/model-capabilities/text/reasoning> (обновлена 2026-09-29, выдержка, ok)
- <https://docs.x.ai/cookbook/examples/bug-report-to-fix> (выдержка, ok)
- <https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.6> (выдержка, ok)
- <https://ai.google.dev/gemini-api/docs/gemini-3> (2026-10-08, выдержка, ok)
- <https://ai.google.dev/gemini-api/docs/interactions/whats-new-gemini-3.5> (выдержка, ok)
- <https://dev.meta.ai/docs/guides/coding-agents> (выдержка, ok)
- <https://developer.meta.com/ai/resources/blog/build-with-muse-spark/> (2026-07-08, выдержка, ok)
- <https://developer.meta.com/ai/resources/blog/build-with-muse-code/> (2026-08-05, выдержка, ok)
- <https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.8-flash> (таймаут, не проверен)

## Найденные и проверенные материалы

7 карточек source-verified: 01 GPT-6.1 Sol, 02 GPT-6 Astra, 03 GLM-5.3, 04 GLM-5.3-Flash, 05 Composer 2.5, 06 Grok 4.7, 07 Gemini Flash-линейка (3.6 GA; 3.8 не подтверждён).

## Дубликаты

- GitHub zai-org/GLM-5 README повторяет тезисы Z.AI — отдельный автор не создаётся.
- Сторонние обзоры Composer 2.5 (datacamp, developersdigest) — пересказ вендора, отдельных авторов нет.
- musespark.ai про Contributor — сторонний сайт, не официальный вендор; в карточки не включён.

## Ошибки доступа

- Gemini 3.8 Flash: fetch страницы whats-new-gemini-3.8-flash — таймаут; покрытие дано через 3.6/3.5 Flash.
- Websearch 429 на одном из запросов OpenAI; закрыто прямым fetch.

## Необработанная часть

- Muse Spark 1.3 Contributor: официальная рекомендация вендора именно для Contributor-tier (а не модели в целом) не найдена; есть данные про Muse Spark 1.1/1.2 и tiers/pricing, но отдельной вендорской рекомендации под точным названием 1.3 Contributor нет.
- Gemini 3.8 Flash: нужна повторная проверка страницы при доступности.
- Привязка рекомендаций к точным категориям плана (интерфейс, ревью и т.п.) — вендоры дают общие классы задач; детальная разбивка отсутствует в источниках.
