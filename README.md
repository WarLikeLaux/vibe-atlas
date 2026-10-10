# Vibe Atlas

Навигатор по AI-подпискам для разработки. Собираем модели, агентов, бенчмарки, лимиты, рекомендации и способы покупки, чтобы помочь выбрать подписки и решить, кого запускать для конкретной задачи.

[Сайт](https://warlikelaux.github.io/vibe-atlas/) · [Цели проекта](PRODUCT.md) · [План разработки](docs/roadmap.md) · [Данные и источники](docs/data-policy.md) · [Архитектура](docs/architecture.md)

## Что уже есть

- React, TypeScript и Vite.
- Стартовая страница с поиском и фильтрацией реестра источников.
- Типизированная схема реестра и проверка данных через Zod.
- Строгие проверки кода, доступности JSX, стилей, Markdown и форматирования.
- Проверка неиспользуемых файлов, экспортов и зависимостей.
- CI и автоматическая публикация на GitHub Pages после успешных проверок.
- Husky запускает полную проверку перед коммитом.

Это начальный каркас проекта. Импорт бенчмарков, проверенные тарифы, отзывы и персональные рекомендации пока не реализованы. Стартовая страница явно показывает этот статус и не выдаёт зарегистрированную ссылку за проверенный факт.

## Запуск

Нужен Node.js 22.12 или новее. В CI используется Node.js 22.

```sh
npm ci
npm run dev
```

Vite выведет локальный адрес с префиксом `/vibe-atlas/`.

```sh
npm run check
npm run preview
```

`check` проверяет типы, данные, код, стили, документы, форматирование и неиспользуемый код, затем собирает сайт. `preview` запускает собранную версию из `dist/`.

## Проверки

| Команда                 | Что проверяет                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`     | TypeScript strict, необработанные индексы, точные optional-поля, неиспользуемые переменные                                            |
| `npm run validate:data` | Структура реестра источников через Zod                                                                                                |
| `npm run lint:code`     | ESLint, typescript-eslint strict со знанием типов, React Hooks, React Refresh, JSX accessibility, imports, Security, SonarJS, Unicorn |
| `npm run lint:styles`   | Stylelint standard                                                                                                                    |
| `npm run lint:docs`     | markdownlint-cli2                                                                                                                     |
| `npm run format:check`  | Prettier                                                                                                                              |
| `npm run check:unused`  | Knip                                                                                                                                  |
| `npm run build`         | Проверка TypeScript и production-сборка Vite                                                                                          |

Для форматирования: `npm run format`. ESLint работает с нулевым допуском к предупреждениям. Локальное исправление стилей: `npx stylelint 'src/**/*.css' --fix`.

`npm run audit:production` проверяет зависимости сайта и выполняется в CI. Полный `npm audit` на 10 октября 2026 сообщает о восьми связанных high findings в инструментах разработки из-за `braces@3.0.3` ([advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)). Исправленной версии `braces` в npm на эту дату нет. Шаблоны glob в командах проекта заданы явно, `braces` не входит в клиентские зависимости. Overrides для `smol-toml` и `katex` устраняют отдельные исправленные advisories, обновления отслеживает Dependabot.

ESLint 9 и Unicorn 62 выбраны как совместимый набор с `eslint-plugin-jsx-a11y`, который пока не объявляет поддержку ESLint 10. Обновлять этот набор нужно вместе, без `--force` и `--legacy-peer-deps`.

## Публикация

Публичный репозиторий публикуется бесплатно на GitHub Pages. В Settings → Pages должен быть выбран источник GitHub Actions. Workflow `.github/workflows/pages.yml` выполняет проверки и сборку для pull request, а для `main` дополнительно публикует проверенный артефакт. Pull request не получает права на деплой.

Путь Vite настроен на `/vibe-atlas/`. Сайт использует ссылки на секции, поэтому не требует серверного SPA fallback. Официальные инструкции: [Vite](https://vite.dev/guide/static-deploy.html#github-pages), [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

## Работа с данными

`data/sources.json` содержит реестр выбранных источников. Новый источник имеет статус `registered` и `lastCheckedAt: null`. Дата регистрации не является датой проверки тарифов или результатов.

Будущий импорт Artificial Analysis должен сохранять исходный снимок, точные названия связок и условия измерений. Секреты импорта остаются в GitHub Actions Secrets. Политика происхождения, свежести и коммерческих ссылок описана в [документе о данных](docs/data-policy.md).
