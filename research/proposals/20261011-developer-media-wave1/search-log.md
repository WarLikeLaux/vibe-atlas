# Журнал поиска

Конечная партия `20261011-developer-media-wave1`. Поиск начат 2026-10-10T18:45:13Z, локальная дата 11 октября 2026 года, UTC+06:00. Чтение основных материалов и сверка текста завершены 2026-10-10T18:52:58Z. Позднее проверен числовой артефакт и выполнен дополнительный поиск по линейкам каталога. Точные времена отдельных web-запросов не записывались.

Поиск использовал публичный web-поиск и чтение страниц, GitHub и Hacker News. Для дат двух комментариев использован публичный HN Firebase API. Для двух роликов проверен публичный YouTube timedtext track list. Пустой ответ этого endpoint не доказывает отсутствие субтитров у ролика. Приватный доступ не использовался.

## Основная волна

Группы запросов охватывали следующие сочетания точного имени с `review`, `coding`, `hands-on`, `developer`, `benchmark` и площадками. Это описание выполненного поиска, а не полный экспорт запросов или всех результатов поисковой системы.

- GPT-6.1 Sol, GPT-6.1 Luna, GPT-6 Luna, GPT-6 Astra, Sol на Hacker News, Astra на simonwillison.net.
- GLM-5.3, GLM-5.3-Flash, опубликованные GitHub benchmarks и практические обзоры.
- Composer 2.5, hands-on real tasks и Hacker News.
- Grok 4.7, Cursor, Cursor Pro, developer experience.
- Gemini 3.8 Flash, YouTube coding leaderboard и developer review.
- MiniMax-M3.1-Flash-Preview, MiniMax-M3, coding tests, hands-on и GitHub.
- Muse Spark 1.3 Contributor, Muse Spark 1.3, coding review и GitHub issues.

Примеры уточняющих запросов: `"GPT-6 Astra" site:simonwillison.net`, `"GPT-6.1 Luna" coding`, `"Composer 2.5" site:news.ycombinator.com`, `"Muse Spark 1.3" site:github.com issues`, `site:github.com "GLM-5.3" "benchmark"`, `"Grok 4.7" "Cursor" developer experience -site:reddit.com -site:x.com`. Для свежих Composer-материалов использовался запрос `"Composer 2.5" hands-on after:2026-07-12 -site:reddit.com -site:x.com`.

Результаты Reddit и X не отбирались. Найденные таблицы вендоров, пересказы официальных leaderboard и рекламные тарифы не импортировались. Поиск продолжался после появления согласных и критических отзывов. Несогласие авторов сохранено в карточках без голосования и подсчёта популярности.

## Дополнительный поиск по каталогу

После отбора основной партии выполнены следующие запросы. Они только расширяют очередь кандидатов. Оригиналы этих результатов не прочитаны и не получили статус `source-verified`.

```text
"GPT-5.6 Terra" "review" coding -site:reddit.com -site:x.com
"Claude" "5.5" "Sonnet" "Haiku" developer review -site:reddit.com -site:x.com
"Gemini" "4 Argon" coding review -site:reddit.com -site:x.com
"Gemini 3.5 Flash Lite" "3.1 Pro" coding review -site:reddit.com -site:x.com
"Muse Glimmer" coding hands-on -site:reddit.com -site:x.com
"Gemini 3 Deep Think" developer coding experience -site:reddit.com -site:x.com
"Claude Opus 5.5" "Sonnet 5.5" hands-on coding review -site:reddit.com -site:x.com
"Fable 5.1" developer coding review -site:reddit.com -site:x.com
"Qwen3.8" "Max" "Flash" coding hands-on -site:reddit.com -site:x.com
"Qwen3.7 Plus" "Qwen3 Coder Next" review coding -site:reddit.com -site:x.com
"DeepSeek V4.1 Flash" "V4 Pro" "Flash Vision" developer review -site:reddit.com -site:x.com
"Kimi K3" "K2.7 Code" "Step 5" coding review -site:reddit.com -site:x.com
```

Совмещённые запросы не заменяют поиск каждой версии отдельно. Qwen3.8 27B и 2.4T A95B отдельно не исследованы. Официальная актуальность всех версий и маршрутизация API в этой роли не сверялись. По этим запросам нельзя утверждать отсутствие материалов в интернете.

## Кандидаты только из поиска

Состояние всех строк `candidate`. Дата публикации по оригиналу и условия замера неизвестны. Поисковые даты и сниппеты не используются как подтверждённые факты. Числа, тарифы и выводы из сниппетов в карточки не перенесены.

| Направление             | URL для следующей партии                                                         | Причина сохранения                                            |
| ----------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| GPT-5.6 Terra           | <https://www.coderabbit.ai/blog/gpt-5-6-sol-and-terra-benchmark>                 | Возможный собственный coding/code-review эксперимент          |
| GPT-5.6 Terra           | <https://www.sonarsource.com/blog/openai-gpt-5-6-sol-and-terra/>                 | Возможный анализ реального кода                               |
| GPT-5.6 Terra           | <https://electricitybench.com/models/codex-cli-gpt-5-6-terra/>                   | Возможный собственный прогон, нужна методология               |
| Haiku 5.5               | <https://www.bitsminds.com/reviews/claude-haiku-5-5-review>                      | Нужно отделить собственный опыт от пересказа индексов         |
| Gemini Flash-Lite / Pro | <https://aireiter.com/blog/gemini-3-5-flash-lite-vs-gemini-3-1-pro>              | Поиск показывает практическое сравнение, оригинал не прочитан |
| Fable 5.1               | <https://www.coderabbit.ai/blog/fable-5-1-model-review>                          | Возможный собственный review эксперимент                      |
| Fable 5.1               | <https://snorkel.ai/blog/fable-5-1-vs-opus-5-coding-benchmark/>                  | Возможный собственный coding эксперимент                      |
| Fable 5.1               | <https://thomas-wiegold.com/blog/claude-fable-5-1-review/>                       | Возможный авторский проект, тот же автор, что в карточке 01   |
| Fable 5.1               | <https://kintal.co/thinking/fable-5-1-fixed-it>                                  | Возможный авторский проект                                    |
| Muse Glimmer            | <https://zolotube.com/watch?v=dtb1ihWSkP4>                                       | Зеркало видео, нужен оригинал и проверенный фрагмент          |
| Qwen3.8-Flash-Next      | <https://codenrob.com/qwen3-8-flash-next-local-setup-guide/>                     | Возможный собственный локальный эксперимент                   |
| DeepSeek V4.1 Flash     | <https://developermemos.com/posts/deepseek-v41-flash-ga/>                        | Проверить первичный опыт и точную версию                      |
| DeepSeek V4.1 Flash     | <https://www.hackaigc.com/blog/deepseek-v4-1-flash-review-speed-vs-freedom-2026> | Возможные собственные измерения, пока только поисковый текст  |

Эти URL не входят в 25 отобранных первичных материалов, поскольку оригиналы не открывались. Для MiniMax-видео промежуточным поисковым указателем был <https://www.bilibili.com/video/BV1bvaV6BE2C/>. Перепечатка не просмотрена и не считается самостоятельным автором.

## Завершение

Лимит выбранной партии исчерпан: 24 страницы первичных материалов и один числовой артефакт того же SlopCodeBench-прогона. Отобраны 12 карточек. Дополнительные результаты остаются очередью следующей партии. Полный каталог не покрыт, бесконечное наблюдение или последующий поиск в этом задании не запускались.
