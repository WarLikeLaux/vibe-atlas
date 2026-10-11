# Reddit: конечная партия практического опыта

Сданы 15 карточек 15 разных публичных авторов из 20 прочитанных тредов. Все карточки имеют `source-verified` для содержания и атрибуции. Пять карточек относятся к конкретным комментариям, десять к постам. Две пары повторных постов сведены в две цепочки. Карточки не интегрированы в каталог и не имеют статуса `ready-for-integration`.

Дата исследования: 11 октября 2026, Asia/Omsk. Начало по часам UTC: 2026-10-10T18:45:10Z. Контрольная сверка источников: 2026-10-10T18:48:38Z. Эти даты различаются из-за часового пояса, а не из-за переноса проверки. Полный [журнал запросов](search-log.md) содержит 24 выполненных запроса, включая повторы и уточнения.

## Что передано

| Карточка                                | Автор                  | Модель и контекст                                                     |
| --------------------------------------- | ---------------------- | --------------------------------------------------------------------- |
| [O01](o01-grok-rust.md)                 | u/akeebismail          | Grok 4.7, Claude, Codex                                               |
| [O02](o02-grok-refactoring.md)          | u/IWillBeNobodyPerfect | Grok 4.7, Grok 4.6, Claude                                            |
| [O03](o03-glm-flash-max-revision.md)    | u/UsandoFXOS           | GLM-5.3-Flash, GLM-5.3, GLM-5.2                                       |
| [O04](o04-glm-flash-high-pi.md)         | u/Kylmawurr            | GLM 5.3 Flash                                                         |
| [O05](o05-glm-vision-plugin.md)         | u/Biacoder             | GLM 5.3, glm-5.3-flash, zai-coding-plan/glm-5.3-flash                 |
| [O06](o06-sol-review-only.md)           | u/TBSchemer            | 6.1-Sol, 5.6-Sol, 6-Luna-Max                                          |
| [O07](o07-sol-low-long-tasks.md)        | u/Hot-Percentage-2240  | 6.1, Low                                                              |
| [O08](o08-astra-integration-failure.md) | u/Fluid\_Meeting\_9153 | Gpt 6 Astra, Astra, claude opus 4.8                                   |
| [O09](o09-astra-low-usage.md)           | u/DataLearnerAI        | GPT-6 Astra, GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.6 Luna                 |
| [O10](o10-muse-contributor-headless.md) | u/ConsiderationNo9952  | muse spark 1.3 contributor, glm5.3 flash, sol, gemini, glm5.3, ds4pro |
| [O11](o11-muse-visual-orchestration.md) | u/Odd\_Donkey2691      | Muse Spark 1.3 Contributor, ChatGPT tera                              |
| [O12](o12-composer-debugging.md)        | u/\_heartbrokekid\_    | Composer 2.5, Sonnet 5, Terra                                         |
| [O13](o13-gemini-audit-mysql.md)        | u/OverallSock495       | Gemini Flash 3.8, 3.7, Claude                                         |
| [O14](o14-gemini-plan-execution.md)     | u/Invader\_86          | 3.8 Flash, Opus, 3.1 pro, Claude                                      |
| [O15](o15-minimax-preview-max.md)       | u/ExerciseEffective558 | M3.1 Flash Preview, M3, DeepSeek 4.1 Flash, GLM 5.3 Flash, Luna       |

Дополнительно переданы [реестр источников](source-ledger.json) и [исходные агрегаты рабочего использования](published-telemetry.json) из O09. JSON не является импортом в общий каталог. В таблице O09 сохранены все четыре исходные строки, единицы и обозначения K/M, итоговый охват и оговорка об оценочной стоимости Astra. Условия неодинаковы, поэтому агрегаты не выдаются за сравнительный бенчмарк или текущие тарифы.

## Просмотренные оригиналы

Все ссылки ниже открыты публичным веб-инструментом. Прочитаны основные посты и доступные релевантные комментарии. Это не полный экспорт деревьев комментариев. Проверка для каждой строки: 2026-10-10T18:48:38Z. Дата в колонке «Выдача» взята из датированной поисковой выдачи, отдельно от даты сверки. Оригинальный абсолютный timestamp неизвестен.

| ID  | Оригинал                                                                                                                                            | Автор поста              | Выдача     | Результат                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ---------- | ---------------------------------------- |
| T01 | [Rust, Grok 4.7](https://www.reddit.com/r/cursor/comments/1wrktgc/am_i_the_only_one_who_thinks_grok_47_is_actually/)                                | u/akeebismail            | 2026-09-27 | O01, O02, содержание source-verified     |
| T02 | [GLM: High/Max и правка автора](https://www.reddit.com/r/ZaiGLM/comments/1w0cfrj/psa_you_must_use_glm53flash_in_max_reasoning_mode/)                | u/UsandoFXOS             | 2026-08-28 | O03, O04, содержание source-verified     |
| T03 | [GLM 5.3 + Flash для изображений](https://www.reddit.com/r/ZaiGLM/comments/1w657uy/i_wired_glm53flash_as_eyes_for_my_textonly_glm53/)               | u/Biacoder               | 2026-09-03 | O05, содержание source-verified          |
| T04 | [Sol 6.1, разный опыт](https://www.reddit.com/r/codex/comments/1wx30p3/title_gpt56_sol_vs_gpt61_sol_for_coding_which_one/)                          | u/Both\_Objective8190    | 2026-10-04 | O06, O07, содержание source-verified     |
| T05 | [GPT-6 Luna, отдельный кандидат](https://www.reddit.com/r/codex/comments/1wyfrun/gpt6_luna/)                                                        | u/Karnemelk              | 2026-10-05 | Без карточки, содержание source-verified |
| T06 | [Astra: интеграция функциональности](https://www.reddit.com/r/developersIndia/comments/1wizyxd/gpt_6_astra_is_terrible_for_coding_and_doesnt/)      | u/Fluid\_Meeting\_9153   | 2026-09-17 | O08, содержание source-verified          |
| T07 | [Astra Low, 11 дней использования](https://www.reddit.com/r/codex/comments/1wdynwu/11_days_of_real_codex_usage_gpt6_astra_low_might/)               | u/DataLearnerAI          | 2026-09-12 | O09, содержание source-verified          |
| T08 | [Muse Contributor, headless](https://www.reddit.com/r/opencode/comments/1w7o67y/muse_spark_13_contributor_muse_code_headless/)                      | u/ConsiderationNo9952    | 2026-09-05 | O10, содержание source-verified          |
| T09 | [Muse Contributor, визуальная оценка](https://www.reddit.com/r/opencode/comments/1wx2198/share_your_orchestration_set_up_to_squeeze_the/)           | u/Odd\_Donkey2691        | 2026-10-04 | O11, содержание source-verified          |
| T10 | [Composer, логи и Datadog](https://www.reddit.com/r/cursor/comments/1vc1m3k/anyone_else_finding_composer_25_surprisingly_good/)                     | u/\_heartbrokekid\_      | 2026-07-31 | O12, содержание source-verified          |
| T11 | [Gemini: MySQL, аудит](https://www.reddit.com/r/google_antigravity/comments/1w5kjli/frustrated_with_gemini_flash_38_it_literally/)                  | u/OverallSock495         | 2026-09-02 | O13, содержание source-verified          |
| T12 | [Gemini: исполнение плана](https://www.reddit.com/r/GeminiAI/comments/1wjmz5x/actually_gemini_38_flash_is_a_beast/)                                 | u/karlelzz011            | 2026-09-18 | O14, содержание source-verified          |
| T13 | [MiniMax Flash Preview Max](https://www.reddit.com/r/MiniMax_AI/comments/1wrbvjw/minimax_m31flash_preview/)                                         | u/ExerciseEffective558   | 2026-09-27 | O15, содержание source-verified          |
| T14 | [Анонс и ограниченно доступные комментарии](https://www.reddit.com/r/MiniMax_AI/comments/1wrzx0e/anyone_tried_m31flashpreview_in_minimax_code_yet/) | u/Altruistic\_Song\_1423 | 2026-09-28 | Без карточки, содержание source-verified |
| T15 | [План миграции платежей, не результат](https://www.reddit.com/r/cursor/comments/1wb4rwg/can_cursor_composer_25_handle_a_refactor_this_big/)         | u/BrutalSlayer69         | 2026-09-08 | Без карточки, содержание source-verified |
| T16 | [Повтор T15](https://www.reddit.com/r/CursorAI/comments/1wbfi4b/can_cursor_composer_25_handle_a_refactor_this_big/)                                 | u/BrutalSlayer69         | 2026-09-09 | Повтор, duplicate                        |
| T17 | [Muse через Codex/прокси, кандидат](https://www.reddit.com/r/opencode/comments/1w6i19c/hater_to_lover_muse_spark_13/)                               | u/Time-Toe-1276          | 2026-09-03 | Без карточки, содержание source-verified |
| T18 | [Повтор T17](https://www.reddit.com/r/opencodeCLI/comments/1w6ultd/hater_to_lover_muse_spark_13/)                                                   | u/Time-Toe-1276          | 2026-09-04 | Повтор, duplicate                        |
| T19 | [Смешанная Sol/Luna/Astra-связка](https://www.reddit.com/r/codex/comments/1wtvwvl/are_you_guys_seeing_this/)                                        | u/dukeispie              | 2026-09-30 | Без карточки, содержание source-verified |
| T20 | [SVG через TokenRouter, демо не просмотрено](https://www.reddit.com/r/grok/comments/1wp5iwr/grok_47_was_supposed_to_crush_opus_and_gpt6_then/)      | u/Obligation19           | 2026-09-24 | Без карточки, содержание source-verified |

В O02, O04, O06 и O07 также прочитан отдельный permalink комментария. В O14 комментарий и автор прочитаны на исходной странице T12, но его отдельный permalink не загрузился. Это ограничение явно сохранено в карточке и реестре, поисковый сниппет не использовался для подтверждения текста.

## Охват основного набора

| Запрошенная позиция        | Результат партии                                                                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GPT-6.1 Sol                | O06 и O07, разный опыт итеративных и длительных задач.                                                                                                          |
| GPT-6.1 Luna               | По точному имени содержательного опыта не выявлено в возвращённой выдаче. T05 относится к GPT-6 Luna. В O06 указана 6-Luna-Max, перенос на 6.1 запрещён.        |
| GPT-6 Astra                | O08 и O09, единичная неудачная интеграция и выбор Low для рабочей выборки.                                                                                      |
| GLM-5.3                    | O03 и O05, старшая модель отдельно от Flash.                                                                                                                    |
| GLM-5.3-Flash              | O03, O04 и O05, разные harness и роли.                                                                                                                          |
| Composer 2.5               | O12, межсервисная отладка. T15/T16 дают кандидатов по автономному исполнению и дроблению миграции, но план автора не является результатом выполненной миграции. |
| Grok 4.7 через Cursor Pro  | O01/O02 относятся к Grok 4.7 и контексту r/cursor. План Pro и фактический маршрут запросов авторов не подтверждены.                                             |
| Gemini 3.8 Flash           | O13/O14, аудит MySQL и исполнение плана.                                                                                                                        |
| MiniMax-M3.1-Flash-Preview | O15, короткий опыт на max в MiniMax Code. Официальный API ID и равенство Space Bunny не проверены.                                                              |
| Muse Spark 1.3 Contributor | O10/O11, headless и собственная оркестрация. Contributor сохранён отдельно от обычной версии.                                                                   |

Названия сопоставлены с редакционным набором по прочитанным `docs/model-scope.md` и `data/model-catalog.json`. Это не новая проверка вендорской документации. Записи, уже помеченные requested, не повышены до подтверждённых моделей. Альтернативы 5.6 Sol, 6 Luna, GLM-5.2, M3, Opus и Sonnet сохранены в исходных названиях. Полный аудит актуальности всех линеек и значимых вариантов вендоров этой конечной партией не выполнен.

## Расхождения и история позиции

- [O01](o01-grok-rust.md) и [O02](o02-grok-refactoring.md): полезность Grok в Rust и плохая читаемость после рефакторинга. Это разные задачи, настройки неизвестны.
- [O03](o03-glm-flash-max-revision.md) и [O04](o04-glm-flash-high-pi.md): Max в opencode и High в настроенном Pi. В O03 сохранены исправление Low на High и последующая оговорка о стабильности для CMS/ERP.
- [O06](o06-sol-review-only.md) и [O07](o07-sol-low-long-tasks.md): у одного автора Sol 6.1 полезен для чтения и review, у другого для длительных задач на Low. Неизвестны задачи и effort первого автора.
- [O08](o08-astra-integration-failure.md) и [O09](o09-astra-low-usage.md): отрицательный единичный случай и положительный опыт выбора Low. Различаются среда, задачи и полнота раскрытия.
- [O13](o13-gemini-audit-mysql.md) и [O14](o14-gemini-plan-execution.md): отрицательный аудит и положительное исполнение чужого плана. Совпадение условий не установлено.
- [O10](o10-muse-contributor-headless.md) и [O11](o11-muse-visual-orchestration.md): первые впечатления от системных задач и ограничения визуального суждения. Они описывают разные границы применения, прямого контролируемого противоречия нет.

Это выводы исследователя о различиях контекста, а не общий рейтинг. Состав выборки не характеризует мнение всех разработчиков. Разные публичные имена не доказывают независимость людей, аккаунтов или экспериментов. Мнения не меняют медали и баллы бенчмарков.

## Повторы

1. [T15](https://www.reddit.com/r/cursor/comments/1wb4rwg/can_cursor_composer_25_handle_a_refactor_this_big/) и [T16](https://www.reddit.com/r/CursorAI/comments/1wbfi4b/can_cursor_composer_25_handle_a_refactor_this_big/): один автор BrutalSlayer69 и совпадающий исходный текст. В T15 есть дополнительное обновление плана. T16 отмечен `duplicate`, второй независимый опыт не создаётся.
2. [T17](https://www.reddit.com/r/opencode/comments/1w6i19c/hater_to_lover_muse_spark_13/) и [T18](https://www.reddit.com/r/opencodeCLI/comments/1w6ultd/hater_to_lover_muse_spark_13/): Time-Toe-1276 повторяет свой отзыв и настройки. Один автор, одна цепочка. Комментарии разных людей при этом могут быть отдельными кандидатами.

Просмотрены `data/sources.json`, существующие импорты AA, Cursor и Terminal-Bench и выполнен поиск Reddit URL в общих `data/`. Совпадений с выбранными Reddit-источниками не найдено. Чужие исследовательские папки не редактировались. Межплощадочную проверку происхождения должен выполнить интегратор после получения всех партий.

## Ошибки доступа и датировка

- Публичный endpoint [Reddit JSON T01](https://www.reddit.com/r/cursor/comments/1wrktgc.json?limit=100) вернул HTTP 403. Авторизация, альтернативные прокси и обход ограничений не использовались. Публичный HTML того же треда оказался читаемым.
- [Комментарий Talkingcrypto](https://www.reddit.com/r/cursor/comments/1wrktgc/comment/pcdcrb0/): Internal Error / Cache miss при переходе. Текст виден в T01, отдельную карточку не создавали.
- [Комментарий Invader\_86](https://www.reddit.com/r/GeminiAI/comments/1wjmz5x/comment/pakehd3/): Internal Error / Cache miss. Содержание O14 сверено по HTML T12. Перед интеграцией нужна повторная проверка permalink.
- [Комментарий Bananenklaus](https://www.reddit.com/r/google_antigravity/comments/1w5kjli/comment/p7ftsfi/): Internal Error / Cache miss. В T11 виден положительный опыт postgres/springboot/htmx, отдельная карточка не создавалась.
- Переход к ответу автора T11 с High и ответу автора T10 про enterprise также вернул Internal Error. Их текст прочитан на родительских страницах. Конкретный URL в ошибке не был возвращён, он не придуман.
- В нескольких открытиях основной текст сначала не выводился. Повторные открытия нужного диапазона строк помогли его прочитать. Это не новая публикация.
- Пример конфликта дат: T05 в поиске датирован 2026-10-05, в открытом HTML имеет относительное «38m ago». T06 в поиске 2026-09-17, в HTML «2h ago». Неизвестно, к какому моменту относится относительная отметка кеша. Поэтому `publishedAt` во всём реестре оставлен `null`. Точные календарные даты и строгая принадлежность каждого комментария окну пока не подтверждены.

По датированной выдаче все отобранные треды попадают в последние 90 суток. Более ранние найденные материалы Composer мая/июня не включены в эту партию. Содержание и авторство карточек подтверждены чтением HTML, дата публикации и актуальное состояние страницы после редактирования остаются отдельными ограничениями.

## Кандидаты, неизвестное и оставшаяся часть

- T05 содержит конкретный опыт Luna 6, включая отладку по журналам IDE и различия проверки БД. Кандидат не превращён в карточку, чтобы не переносить его на запрошенную Luna 6.1.
- T14: в поисковой выдаче есть отрицательные отзывы о галлюцинациях, инструментах и скорости M3.1. В открытом фрагменте эти комментарии не найдены. Они остаются `needs-context`, неизвестны авторы и permalink. Положительный O15 не выдаётся за согласие всего сообщества.
- T15: рекомендации о дроблении большой миграции и критика автономности Composer полезны для следующей партии. Наличие плана платежной миграции не подтверждает её успешное выполнение.
- T17/T18: полезный кандидат по Muse в Rust/TypeScript через Codex и прокси. Contributor не подтверждён автором основного текста точным ID, перенос с обычного названия запрещён.
- T19: оригинальный пост описывает смешанную Sol/Luna/Astra-связку. Нельзя приписать весь результат Sol. Автоматическое резюме dextersummary в комментариях не используется как новое мнение разработчика.
- T20: прочитан текст о сравнении SVG через TokenRouter, но GIF, полный промпт, код и выводы вендорских бенчмарков отдельно не проверены. Текст соответствует `source-verified`, визуальный результат остаётся `needs-context`.
- Репозиторий и npm из O05, скриншоты O09 и любые внешние демо не воспроизводились. Коммерческие связи неизвестны, кроме описанного самопродвижения своего плагина в O05. Авторство собственного preset в O11 сохранено, но не доказывает оплату или рекламу.
- Reddit score не собирался. Числа из кешированных сниппетов не представлены как текущие наблюдения или число сторонников.

Конечная партия завершена в пределах 20 тредов и 15 карточек. Оставшиеся шаги относятся к отдельной сверке и интеграции: точные даты, API ID, доступность комментариев, межплощадочные дубликаты, дополнительные линии моделей и независимое воспроизведение. Исследование не остановлено в ожидании дополнительных разрешений.

## Проверка файлов

Карточки следуют `docs/templates/media-opinion.md`. Сохранены исходные названия и effort, неизвестности, источник и UTC-дата проверки, история правок, ограничения доступа и коммерческие связи. Интеграции, публикации, commit и push не было. `npm run check` не запускался: общие данные и приложение не изменялись, сборка создала бы файлы вне разрешённой папки. Собственные файлы прошли Prettier и markdownlint-cli2. Дополнительно проверены JSON, обязательные разделы карточек, количество авторов и материалов, локальные ссылки и отсутствие запрещённых данных. Глобальное форматирование не выполнялось.
