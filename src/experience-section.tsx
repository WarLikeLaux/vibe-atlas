import { useState } from 'react'

import { verifiedOpinions, verifiedPolls } from './data/experience'

const dateFormat = new Intl.DateTimeFormat('ru', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
})

const positions = new Map([
    ['positive', 'За'],
    ['negative', 'Против'],
    ['mixed', 'Смешанное'],
    ['unclear', 'Неясно'],
])

const platforms = new Map([
    ['reddit', 'Reddit'],
    ['developer-media', 'Медиа'],
    ['x', 'X'],
])

function checkedAtOf(value: string | null | undefined, fallback: string) {
    return value ?? fallback
}

export function ExperienceSection() {
    const [query, setQuery] = useState('')
    const [platform, setPlatform] = useState('all')
    const [position, setPosition] = useState('all')
    const normalizedQuery = query.trim().toLocaleLowerCase('ru')
    const opinions = verifiedOpinions.filter(
        (opinion) =>
            (platform === 'all' || opinion.platform === platform) &&
            (position === 'all' || opinion.position === position) &&
            `${opinion.author.name} ${opinion.model.rawLabel} ${opinion.task ?? ''} ${opinion.summary}`
                .toLocaleLowerCase('ru')
                .includes(normalizedQuery),
    )
    const usedPlatforms = [...new Set(verifiedOpinions.map((opinion) => opinion.platform))]
    const usedPositions = [...new Set(verifiedOpinions.map((opinion) => opinion.position))]

    return (
        <section
            className="catalog-section wrap"
            id="experience"
            aria-labelledby="experience-title"
        >
            <div className="section-heading">
                <div>
                    <h2 id="experience-title">Опыт разработчиков</h2>
                    <p>
                        Проверенные мнения из первой партии исследований. Мнение не измерение:
                        медалей и мест не даёт.
                    </p>
                </div>
            </div>
            <div className="catalog-tools">
                <div className="search-field">
                    <label htmlFor="experience-query">Найти мнение</label>
                    <input
                        id="experience-query"
                        type="search"
                        placeholder="Модель, задача или автор"
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value)
                        }}
                    />
                </div>
                <div className="kind-field">
                    <label htmlFor="experience-platform">Площадка</label>
                    <select
                        id="experience-platform"
                        value={platform}
                        onChange={(event) => {
                            setPlatform(event.target.value)
                        }}
                    >
                        <option value="all">Все площадки</option>
                        {usedPlatforms.map((name) => (
                            <option key={name} value={name}>
                                {platforms.get(name) ?? name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="kind-field">
                    <label htmlFor="experience-position">Отношение</label>
                    <select
                        id="experience-position"
                        value={position}
                        onChange={(event) => {
                            setPosition(event.target.value)
                        }}
                    >
                        <option value="all">Любое</option>
                        {usedPositions.map((name) => (
                            <option key={name} value={name}>
                                {positions.get(name) ?? name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <p className="result-count" role="status">
                Найдено: {opinions.length} из {verifiedOpinions.length}
            </p>
            {opinions.length > 0 ? (
                <ul className="source-list">
                    {opinions.map((opinion) => (
                        <li className="source-row" key={opinion.id}>
                            <div className="source-name">
                                <a className="source-link" href={opinion.primaryUrl}>
                                    {opinion.author.name} · {opinion.model.rawLabel}
                                </a>
                                <p>{opinion.summary}</p>
                                {opinion.task && <p>Задача: {opinion.task}</p>}
                                {opinion.agentAndConfiguration && (
                                    <p>Среда: {opinion.agentAndConfiguration}</p>
                                )}
                            </div>
                            <span className="source-kind">
                                {positions.get(opinion.position) ?? opinion.position}
                            </span>
                            <div className="source-status">
                                <span>{platforms.get(opinion.platform) ?? opinion.platform}</span>
                                <small>
                                    Проверено{' '}
                                    <time
                                        dateTime={checkedAtOf(
                                            opinion.originalCheckedAt,
                                            opinion.aggregationCheckedAt,
                                        )}
                                    >
                                        {dateFormat.format(
                                            new Date(
                                                checkedAtOf(
                                                    opinion.originalCheckedAt,
                                                    opinion.aggregationCheckedAt,
                                                ),
                                            ),
                                        )}
                                    </time>
                                </small>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="empty-state">
                    <h3>Мнения не найдены</h3>
                    <p>Измените запрос или фильтры.</p>
                    <button
                        type="button"
                        onClick={() => {
                            setQuery('')
                            setPlatform('all')
                            setPosition('all')
                        }}
                    >
                        Сбросить фильтры
                    </button>
                </div>
            )}
            {verifiedPolls.map((poll) => (
                <article className="poll-card" key={poll.id}>
                    <h3>Опрос: {poll.question}</h3>
                    <p className="catalog-footnote">
                        {poll.respondents !== null &&
                            poll.respondents !== undefined &&
                            `Ответов: ${poll.respondents.toLocaleString('ru')}. `}
                        {poll.fieldingStart &&
                            poll.fieldingEnd &&
                            `Проведён ${poll.fieldingStart} — ${poll.fieldingEnd}. `}
                        {poll.selection && `Срез: ${poll.selection}. `}
                        {poll.sources.map((source, index) => (
                            <span key={source.url}>
                                {index > 0 && ' · '}
                                <a href={source.url}>Источник {index + 1}</a>
                            </span>
                        ))}
                    </p>
                    <ol className="poll-rows">
                        {poll.rows.slice(0, 10).map((row) => (
                            <li key={row.option}>
                                <span>{row.option}</span>
                                <strong>
                                    {row.percent !== null &&
                                        row.percent !== undefined &&
                                        `${row.percent.toLocaleString('ru')}%`}
                                </strong>
                            </li>
                        ))}
                    </ol>
                </article>
            ))}
            <p className="catalog-footnote">
                Показаны только проверенные записи. Непроверенные мнения и кандидаты опросов
                остаются в исследовательских материалах.
            </p>
        </section>
    )
}
