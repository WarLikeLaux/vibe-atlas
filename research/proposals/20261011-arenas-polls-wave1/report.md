# Арены и опросы: результат конечной партии

Сданы 12 карточек: восемь по бенчмаркам и четыре по опросам. Четыре снимка Arena содержат 693 строки, отдельный снимок Stack Overflow содержит 33 варианта ответа. Все материалы находятся в этой папке, каталог и импорты проекта не изменены.

## Границы и проверка

- Исследование выполнено 11 октября 2026 по UTC+06. Контроль времени: 2026-10-10 18:45:36 UTC и 18:49:34 UTC, оба соответствуют 11 октября в UTC+06. Дата проверки материалов: 2026-10-10T18:49:34Z.
- Окно свежих мнений: 2026-07-13 по 2026-10-11. Методологии старше окна обозначены отдельно. Дата на динамической таблице обозначает срез, не начало набора голосов.
- Просмотрены восемь исследовательских площадок: Arena/WebDev, Design Arena, BigCodeArena, Copilot Arena, Reddit, X, Stack Overflow и ZDNET. Copilot Arena связана с lmarena, эти восемь площадок не означают восемь независимых операторов.
- Выполнены попытки чтения 25 уникальных первичных страниц. 21 страница прочитана, четыре попытки завершились ошибкой. Прочитанная оболочка не означает прочитанный leaderboard.
- Источники: [sources.json](sources.json). Поисковые запросы и ограничения: [search-log.md](search-log.md). SHA-256 числовых снимков: [checksums.json](checksums.json).
- Прочитаны task.md, AGENTS.md, PRODUCT.md, handoff, model-scope, data-policy, research-workflow, benchmark-methodology и benchmark-finding. Проверены data/sources.json и действующие data/, scripts/ и документы импортов на повторное подключение найденных арен. Дубликатов этих источников среди просмотренных импортов не обнаружено.

## Карточки и возможность интеграции

| Карточка                                              | Статус          | Передано                                             | Решение                                                                   |
| ----------------------------------------------------- | --------------- | ---------------------------------------------------- | ------------------------------------------------------------------------- |
| [WebDev Overall](benchmark-arena-webdev.md)           | source-verified | 142 строки, срез 2026-10-08                          | Кандидат отдельного столбца предпочтений после сопоставления конфигураций |
| [Text Coding](benchmark-arena-coding.md)              | source-verified | 409 строк, срез 2026-10-08                           | Отдельный тест предпочтений в текстовых coding задачах                    |
| [Image-to-WebDev](benchmark-arena-image-to-webdev.md) | source-verified | 64 строки, срез 2026-10-09                           | Отдельный сценарий по изображениям                                        |
| [WebDev Fullstack](benchmark-arena-fullstack.md)      | source-verified | 78 строк, срез 2026-10-08                            | Поднабор WebDev, не дополнительный независимый тест                       |
| [Design Arena](benchmark-designarena.md)              | needs-context   | Проверенная методология, без чисел                   | Получить клиентскую таблицу                                               |
| [BigCodeArena](benchmark-bigcodearena.md)             | source-verified | Историческая методология, 4,731 voting samples       | Не переносить старые результаты на текущие модели                         |
| [AutoCodeArena](benchmark-autocodearena.md)           | source-verified | Исторический протокол model judge, без баллов        | Отдельный автоматический тест, не человеческое голосование                |
| [Copilot Arena](benchmark-copilot-arena.md)           | source-verified | Abstract и README, без текущего рейтинга             | Дальнейшая проверка IDE-сценария                                          |
| [Stack Overflow](poll-stackoverflow-coding-agents.md) | source-verified | 33 варианта Used, n=12,255                           | Отдельный слой опросов использования агентов                              |
| [Reddit poll](poll-reddit-candidate.md)               | needs-context   | Старый недоступный кандидат, без результатов         | Не интегрировать                                                          |
| [X poll](poll-x-candidate.md)                         | needs-context   | Недоступный старый кандидат, противоречащие сниппеты | Не интегрировать                                                          |
| [ZDNET survey](poll-zdnet-candidate.md)               | needs-context   | Свежий кандидат по поиску, оригинал не прочитан      | Не интегрировать до первичной сверки                                      |

Итого восемь source-verified и четыре needs-context. Ни одна карточка не помечена ready-for-integration. Проверка оригинала подтверждает происхождение, а соответствия каталогу, точные агентские конфигурации и полнота протоколов остаются отдельной работой.

## Что полезно для основного набора

Четыре [таблицы Arena](https://arena.ai/leaderboard/code/webdev), [Text Coding](https://arena.ai/leaderboard/chat/text/coding), [Image-to-WebDev](https://arena.ai/leaderboard/code/image-to-webdev) и [Fullstack](https://arena.ai/leaderboard/code/webdev/fullstack), проверенные 2026-10-10T18:49:34Z, содержат точные исходные имена конфигураций. В карточках выделены целевые и соседние версии, в JSON сохранены все строки:

- GPT-6.1 Sol присутствует как gpt-6.1-sol-max в трёх таблицах, в прочитанном Fullstack отсутствует. GPT-6 Astra присутствует как gpt-6-astra-max.
- GPT-6.1 Luna не найдена. Найденная gpt-6-luna-max остаётся другой версией.
- GLM-5.3 представлена как glm-5.3-max в WebDev, Text Coding и Fullstack. GLM-5.3-Flash представлена как glm-5.3-flash во всех четырёх.
- Grok 4.7 представлен как grok-4.7-xhigh. Эти замеры не подтверждают запуск через Cursor Pro.
- Gemini 3.8 Flash представлена как gemini-3.8-flash-high с отметкой Preliminary.
- Composer 2.5 и MiniMax-M3.1-Flash-Preview в четырёх таблицах не найдены. minimax-m3 сохраняется отдельной соседней версией.
- Muse Spark 1.3 присутствует как muse-spark-1.3-max и muse-spark-1.3 (xHigh), Contributor не найден. На Contributor эти значения не переносятся.

Наличие имени в таблице не является самостоятельной проверкой официального API ID, latest-статуса или семантики effort. Эти поля сохраняются неизвестными. Исторические и дополнительные модели в полных снимках не объявлены актуальным каталогом.

## Различия доказательств

[FAQ Arena](https://arena.ai/faq), проверено 2026-10-10T18:49:34Z, описывает слепые парные человеческие оценки. [Design Arena](https://www.designarena.ai/about), проверено 2026-10-10T18:49:34Z, использует турнирные пары. [BigCode](https://huggingface.co/blog/bigcode/arena), проверено 2026-10-10T18:49:34Z, различает людей с выполнением кода и AutoCodeArena с Claude-3.7-Sonnet как судьёй. Подтверждённого свежего экспертного жюри для целевых моделей в этой партии не найдено, глобального вывода об отсутствии таких соревнований нет.

Опрос [Stack Overflow](https://survey.stackoverflow.co/2026/ai/data), проверено 2026-10-10T18:49:34Z, описывает использование coding agents за прошлый год. Это не выбор одной лучшей модели. Ответы допускают несколько инструментов и не превращаются в Elo, медали или долю успешных задач. Его fielding начался до окна и завершился внутри окна, версии моделей не фиксируются.

## Дубликаты и исключения

- В WebDev две строки имеют одинаковую подпись gpt-5.3-codex (codex-harness): rank 87 и 102. Это повторно подтверждено по [оригиналу](https://arena.ai/leaderboard/code/webdev) 11 октября 2026. Разные Score и Votes сохранены отдельно, причина совпадения подписи не установлена. Перед интеграцией нельзя использовать только имя как ключ или молча выбирать лучший результат.
- Индекс Code Arena и подробная WebDev-страница являются навигацией и таблицей одной площадки. Старые домены и query-параметры Arena не создают независимый замер.
- Fullstack является поднабором WebDev. Числа голосов по строкам и таблицам нельзя складывать как уникальных людей или независимые исследования.
- Stack Overflow /ai повторяет /ai/data. В машинную карточку внесён один опубликованный срез Used.
- BenchLeader, OpenCharts, BenchmarkList, CodeSOTA и ModelCap найдены только в поиске. Они не добавлены как независимые рейтинги Arena, опубликованные там числа не заимствовались.
- Пересказы одного опроса ZDNET на Yahoo, французском сайте издателя, Skim, Zetik и OTF не создают новые выборки. Первичная сверка пока отсутствует.
- [Тема Reddit о Composer и Grok](https://www.reddit.com/r/cursor/comments/1wuld0l/it_seems_many_if_not_most_in_this_sub_prefers/), проверено 2026-10-10T18:49:34Z, содержит discussion и комментарии, а не подтверждённый native poll. Самостоятельный подсчёт отзывов не проводился, личные мнения этой партией не дублировались.
- Сниппеты X trending и PDF не являются source-verified poll results. Likes, views, Reddit score и число комментариев не использовались как число голосов.

## Доступ, неизвестное и незавершённая часть

У X получен 403, у Reddit poll Error fetching, у предполагаемого ZDNET URL non-retryable error, у неподтверждённого домена copilot-arena.com Internal Error. Прямой HTTP к Arena WebDev дополнительно вернул Cloudflare 403, но web.open позволил прочитать первичную таблицу. Design Arena вернула 200 с оболочкой без числовых строк. BigCode Space показал Running и iframe, актуальная таблица не прочитана. Детали и даты указаны в [реестре](sources.json).

Конечная партия завершена. Неполнота не скрыта: другие категории Arena и Design Arena, полные datasets, полные статьи, frontend-соревнования за пределами этих площадок, актуальная таблица BigCodeArena/Copilot Arena и успешная сверка трёх poll-кандидатов не выполнены. Подтверждённых свежих native polls X/Reddit для основного набора в просмотренной области нет. Поиск в пределах партии не доказывает их отсутствия в сети.

Для Arena неизвестны точные harness, системные промпты, budgets, периоды накопления, уникальные респонденты и настройки интервалов данного среза. Сохранены исходные поля rank, rank spread, model, score с интервалом и preliminary, votes, Price $/M, Context и организация/лицензия. У ссылок моделей извлечён домен, полный target URL не извлечён. API-тарифы не переименованы в стоимость запуска. Отдельный поиск недостающих токенов не проводился.

## Проверка передачи

JSON разобраны, количество строк сверено с заголовками, ранги проверены на уникальность и отсутствие пропусков, обязательные поля и локальные ссылки проверены. Сохранены SHA-256 пяти числовых файлов. Публичные материалы не содержат секретов, локальных абсолютных путей, приватных сессий или персональных настроек.

npm run check не запускался: публикация, интеграция и изменения поведения не выполнялись, а сборка могла бы записать файлы вне разрешённой папки. Дополнительные агенты, commit, push и внешние сообщения не использовались.

## Просмотренные первичные страницы

Дата проверки реестра: 2026-10-10T18:49:34Z. «Прочитана» относится к доступному телу страницы, числовые ограничения описаны выше.

| №   | Площадка      | Оригинал                                                                                                                      | Доступ         |
| --- | ------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------- |
| P01 | arena         | [страница](https://arena.ai/leaderboard/code)                                                                                 | Прочитана      |
| P02 | arena         | [страница](https://arena.ai/leaderboard/chat/text/coding)                                                                     | Прочитана      |
| P03 | designarena   | [страница](https://www.designarena.ai/)                                                                                       | Прочитана      |
| P04 | designarena   | [страница](https://www.designarena.ai/leaderboard)                                                                            | Прочитана      |
| P05 | arena         | [страница](https://arena.ai/leaderboard/code/webdev)                                                                          | Прочитана      |
| P06 | arena         | [страница](https://arena.ai/leaderboard/code/image-to-webdev)                                                                 | Прочитана      |
| P07 | arena         | [страница](https://arena.ai/faq)                                                                                              | Прочитана      |
| P08 | arena         | [страница](https://arena.ai/blog/arena-rank)                                                                                  | Прочитана      |
| P09 | designarena   | [страница](https://www.designarena.ai/leaderboard/code)                                                                       | Прочитана      |
| P10 | designarena   | [страница](https://www.designarena.ai/about)                                                                                  | Прочитана      |
| P11 | bigcodearena  | [страница](https://huggingface.co/blog/bigcode/arena)                                                                         | Прочитана      |
| P12 | bigcodearena  | [страница](https://github.com/bigcode-project/bigcodearena)                                                                   | Прочитана      |
| P13 | copilot-arena | [страница](https://copilot-arena.com)                                                                                         | Ошибка доступа |
| P14 | copilot-arena | [страница](https://github.com/lmarena/copilot-arena)                                                                          | Прочитана      |
| P15 | arena         | [страница](https://help.arena.ai/articles/7011479247-how-to-see-ai-rankings-in-arena-leaderboards-2-0-wip)                    | Прочитана      |
| P16 | arena         | [страница](https://arena.ai/leaderboard/code/webdev/fullstack)                                                                | Прочитана      |
| P17 | bigcodearena  | [страница](https://huggingface.co/spaces/bigcode/arena)                                                                       | Прочитана      |
| P18 | copilot-arena | [страница](https://arxiv.org/abs/2502.09328)                                                                                  | Прочитана      |
| P19 | reddit        | [страница](https://www.reddit.com/r/cursor/comments/1wuld0l/it_seems_many_if_not_most_in_this_sub_prefers/)                   | Прочитана      |
| P20 | x             | [страница](https://x.com/aniketapanjwani/status/2029934969141760234)                                                          | Ошибка доступа |
| P21 | reddit        | [страница](https://www.reddit.com/r/OnlyAICoding/comments/1i9sbq1)                                                            | Ошибка доступа |
| P22 | stackoverflow | [страница](https://survey.stackoverflow.co/2026/ai)                                                                           | Прочитана      |
| P23 | stackoverflow | [страница](https://survey.stackoverflow.co/2026/methodology)                                                                  | Прочитана      |
| P24 | zdnet         | [страница](https://www.zdnet.com/article/75-of-developers-i-surveyed-prefer-claude-code-heres-why-they-choose-it-over-codex/) | Ошибка доступа |
| P25 | stackoverflow | [страница](https://survey.stackoverflow.co/2026/ai/data)                                                                      | Прочитана      |
