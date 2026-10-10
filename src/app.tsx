import { useState } from 'react'

import { catalog } from './data/catalog'
import type { Source } from './data/catalog'

const repository = 'https://github.com/WarLikeLaux/vibe-atlas'

function sourceKind(kind: Source['kind']) {
    switch (kind) {
        case 'benchmark': {
            return 'Бенчмарки'
        }
        case 'vendor': {
            return 'Вендор'
        }
        case 'community': {
            return 'Сообщество'
        }
    }
}

export function App() {
    const [query, setQuery] = useState('')
    const [kind, setKind] = useState('all')
    const normalizedQuery = query.trim().toLocaleLowerCase('ru')
    const sources = catalog.sources.filter(
        (source) =>
            (kind === 'all' || source.kind === kind) &&
            `${source.name} ${source.subject}`.toLocaleLowerCase('ru').includes(normalizedQuery),
    )

    return (
        <>
            <a className="skip-link" href="#main">
                К содержимому
            </a>
            <header className="site-header wrap">
                <a className="brand" href="#main" aria-label="Vibe Atlas, начало страницы">
                    <span className="brand-symbol" aria-hidden="true">
                        va
                    </span>
                    <span>Vibe Atlas</span>
                </a>
                <nav aria-label="Основная навигация">
                    <a href="#sources">Источники</a>
                    <a href="#principles">Методология</a>
                    <a href="#roadmap">План</a>
                </nav>
                <a className="github-link" href={repository}>
                    GitHub
                </a>
            </header>

            <main id="main">
                <section className="hero wrap" aria-labelledby="hero-title">
                    <div className="hero-copy">
                        <h1 id="hero-title">Больше ясности в AI-подписках.</h1>
                        <p className="lead">
                            Какие модели доступны, на что хватит лимита и кого выбрать для задачи.
                            Собираем условия, бенчмарки и опыт разработчиков в один атлас.
                        </p>
                        <a className="primary-link" href="#sources">
                            Посмотреть источники
                        </a>
                        <p className="launch-status">
                            <span aria-hidden="true" />
                            Открытый проект. Первая версия в разработке.
                        </p>
                    </div>
                    <aside className="decision-note" aria-label="Что поможет выбрать Vibe Atlas">
                        <h2>
                            Одна задача. <br />
                            Несколько путей.
                        </h2>
                        <dl>
                            <div>
                                <dt>Агент и модель</dt>
                                <dd>Точная связка и условия запуска</dd>
                            </div>
                            <div>
                                <dt>Подписка</dt>
                                <dd>Лимиты, окна сброса и общие пулы</dd>
                            </div>
                            <div>
                                <dt>Основания выбора</dt>
                                <dd>Бенчмарки, рекомендации, источники</dd>
                            </div>
                        </dl>
                        <p>Покупать осознанно. Использовать по задаче.</p>
                    </aside>
                </section>

                <section className="catalog-section" id="sources" aria-labelledby="sources-title">
                    <div className="wrap">
                        <div className="section-heading">
                            <div>
                                <h2 id="sources-title">С чего начинаем</h2>
                                <p>Реестр источников для будущего каталога.</p>
                            </div>
                            <a className="text-link" href={`${repository}/issues/new`}>
                                Предложить источник
                            </a>
                        </div>
                        <div className="catalog-tools">
                            <div className="search-field">
                                <label htmlFor="source-query">Найти источник</label>
                                <input
                                    id="source-query"
                                    type="search"
                                    placeholder="Название или тема"
                                    value={query}
                                    onChange={(event) => {
                                        setQuery(event.target.value)
                                    }}
                                />
                            </div>
                            <div className="kind-field">
                                <label htmlFor="source-kind">Тип источника</label>
                                <select
                                    id="source-kind"
                                    value={kind}
                                    onChange={(event) => {
                                        setKind(event.target.value)
                                    }}
                                >
                                    <option value="all">Все источники</option>
                                    <option value="benchmark">Бенчмарки</option>
                                    <option value="vendor">Вендоры</option>
                                    <option value="community">Сообщество</option>
                                </select>
                            </div>
                        </div>
                        <p className="result-count" role="status">
                            Найдено: {sources.length} из {catalog.sources.length}
                        </p>
                        {sources.length > 0 ? (
                            <ul className="source-list">
                                {sources.map((source) => (
                                    <li className="source-row" key={source.id}>
                                        <div className="source-name">
                                            <a className="source-link" href={source.url}>
                                                {source.name}
                                            </a>
                                            <p>{source.subject}</p>
                                        </div>
                                        <span className="source-kind">
                                            {sourceKind(source.kind)}
                                        </span>
                                        <div className="source-status">
                                            <span>Ожидает проверки</span>
                                            <small>
                                                Зарегистрирован{' '}
                                                <time dateTime={source.registeredAt}>
                                                    {new Intl.DateTimeFormat('ru', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        timeZone: 'UTC',
                                                    }).format(new Date(source.registeredAt))}
                                                </time>
                                            </small>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="empty-state">
                                <h3>Источники не найдены</h3>
                                <p>Измените запрос или выберите другой тип источника.</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery('')
                                        setKind('all')
                                    }}
                                >
                                    Сбросить фильтры
                                </button>
                            </div>
                        )}
                        <p className="catalog-footnote">
                            Дата регистрации относится к ссылке. Проверенные тарифы и результаты
                            появятся после сбора данных.
                        </p>
                    </div>
                </section>

                <section
                    className="principles wrap"
                    id="principles"
                    aria-labelledby="principles-title"
                >
                    <div className="principles-intro">
                        <h2 id="principles-title">Данные, которым можно задать вопросы.</h2>
                        <p>
                            Что измерили? Кто сообщил? Когда проверили? На этих ответах строится
                            атлас.
                        </p>
                        <a
                            className="text-link"
                            href={`${repository}/blob/main/docs/data-policy.md`}
                        >
                            Политика данных
                        </a>
                    </div>
                    <div className="principle-list">
                        <article>
                            <h3>Источник и дата</h3>
                            <p>
                                У каждого факта будет ссылка на основание и дата последней успешной
                                проверки.
                            </p>
                        </article>
                        <article>
                            <h3>Точные условия</h3>
                            <p>
                                Агент, модель, effort и версия бенчмарка сохраняются вместе с
                                результатом. Квоты остаются в исходных единицах.
                            </p>
                        </article>
                        <article>
                            <h3>Разные виды доказательств</h3>
                            <p>
                                Заявления вендоров, независимые измерения и опыт разработчиков будут
                                обозначены отдельно.
                            </p>
                        </article>
                        <article>
                            <h3>Прозрачные рекомендации</h3>
                            <p>
                                Выбор под задачу должен быть объяснимым. Партнёрские ссылки будут
                                отмечены и не повлияют на рейтинг.
                            </p>
                        </article>
                    </div>
                </section>

                <section className="roadmap wrap" id="roadmap" aria-labelledby="roadmap-title">
                    <div className="section-heading">
                        <div>
                            <h2 id="roadmap-title">Что появится дальше</h2>
                            <p>От проверяемых данных к выбору под вашу задачу.</p>
                        </div>
                        <a className="text-link" href={`${repository}/blob/main/docs/roadmap.md`}>
                            Полный план
                        </a>
                    </div>
                    <ol className="roadmap-list">
                        <li>
                            <h3>Каталог подписок</h3>
                            <p>Модели, совместимость, квоты и условия покупки.</p>
                        </li>
                        <li>
                            <h3>Бенчмарки и опыт</h3>
                            <p>Импорт Artificial Analysis и рекомендации с контекстом.</p>
                        </li>
                        <li>
                            <h3>Ваш набор инструментов</h3>
                            <p>Порядок использования подписок и будущая интеграция с HAPI.</p>
                        </li>
                    </ol>
                </section>
            </main>
            <footer className="site-footer wrap">
                <p>Vibe Atlas</p>
                <p>Собираем основания для хорошего выбора.</p>
                <a href={repository}>Код и документация</a>
            </footer>
        </>
    )
}
