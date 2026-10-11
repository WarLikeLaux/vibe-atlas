import { useState } from 'react'

import { subscriptionGuide, vendorRecommendations } from './data/guide'

const dateFormat = new Intl.DateTimeFormat('ru', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
})

function priceText(billing: {
    amount?: number | null | undefined
    currency?: string | null | undefined
    unit?: string | null | undefined
}): string {
    if (billing.amount === null || billing.amount === undefined) return 'Цена не раскрыта'
    const currency = billing.currency ?? ''
    const unit = billing.unit ? ` / ${billing.unit}` : ''
    return `${billing.amount.toLocaleString('ru')} ${currency}${unit}`
}

function modelScopeText(
    entries: { catalogPriority: string; pool?: string | null | undefined }[] | null | undefined,
): string {
    return (entries ?? [])
        .map((entry) =>
            entry.pool ? `${entry.catalogPriority} (${entry.pool})` : entry.catalogPriority,
        )
        .join(' · ')
}

function limitText(limit: {
    value?: number | string | null | undefined
    unit?: string | null | undefined
    unknownReason?: string | null | undefined
}): string {
    if (limit.value === null || limit.value === undefined)
        return limit.unknownReason ?? 'Неизвестно'
    if (typeof limit.value === 'number')
        return `${limit.value.toLocaleString('ru')} ${limit.unit ?? ''}`
    return `${limit.value} ${limit.unit ?? ''}`
}

export function GuideSection() {
    const [query, setQuery] = useState('')
    const normalizedQuery = query.trim().toLocaleLowerCase('ru')
    const subscriptions = subscriptionGuide.subscriptions.filter((subscription) =>
        `${subscription.vendor} ${subscription.planLabel} ${(subscription.modelsInScope ?? [])
            .map((entry) => entry.catalogPriority)
            .join(' ')}`
            .toLocaleLowerCase('ru')
            .includes(normalizedQuery),
    )

    return (
        <section className="catalog-section wrap" id="guide" aria-labelledby="guide-title">
            <div className="section-heading">
                <div>
                    <h2 id="guide-title">Рекомендации вендоров и подписки</h2>
                    <p>
                        Что советуют разработчики моделей и сколько стоят подписки. Проверено{' '}
                        <time dateTime={vendorRecommendations.checkedAt}>
                            {dateFormat.format(new Date(vendorRecommendations.checkedAt))}
                        </time>
                        .
                    </p>
                </div>
            </div>
            <h3>Кому что советуют</h3>
            <ul className="source-list">
                {vendorRecommendations.recommendations.map((recommendation) => (
                    <li className="source-row" key={recommendation.id}>
                        <div className="source-name">
                            <a className="source-link" href={recommendation.sourceUrl}>
                                {recommendation.vendor} · {recommendation.model}
                            </a>
                            <p>«{recommendation.quote}»</p>
                            <p>Задачи: {recommendation.tasks}</p>
                        </div>
                        <span className="source-kind">Вендор</span>
                        <div className="source-status">
                            <span>Рекомендация</span>
                            <small>
                                Проверено{' '}
                                <time dateTime={recommendation.checkedAt}>
                                    {dateFormat.format(new Date(recommendation.checkedAt))}
                                </time>
                            </small>
                        </div>
                    </li>
                ))}
            </ul>
            <h3>Справочник подписок</h3>
            <div className="search-field">
                <label htmlFor="guide-query">Найти подписку</label>
                <input
                    id="guide-query"
                    type="search"
                    placeholder="Вендор, план или модель"
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value)
                    }}
                />
            </div>
            <p className="result-count" role="status">
                Найдено: {subscriptions.length} из {subscriptionGuide.subscriptions.length}
            </p>
            {subscriptions.length > 0 ? (
                <ul className="source-list">
                    {subscriptions.map((subscription) => (
                        <li className="source-row" key={subscription.id}>
                            <div className="source-name">
                                <span className="source-link">
                                    {subscription.vendor} · {subscription.planLabel}
                                </span>
                                <p>{priceText(subscription.billing ?? {})}</p>
                                {(subscription.modelsInScope ?? []).length > 0 && (
                                    <p>Модели: {modelScopeText(subscription.modelsInScope)}</p>
                                )}
                                {subscription.limits.map((limit) => (
                                    <p key={limit.name}>
                                        {limit.name}: {limitText(limit)}
                                        {limit.resetWindow && ` · ${limit.resetWindow.description}`}
                                    </p>
                                ))}
                            </div>
                            <span className="source-kind">Подписка</span>
                            <div className="source-status">
                                <span>{subscriptionGuide.batchId}</span>
                                <small>{subscriptionGuide.note}</small>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="empty-state">
                    <h3>Подписки не найдены</h3>
                    <p>Измените запрос.</p>
                    <button
                        type="button"
                        onClick={() => {
                            setQuery('')
                        }}
                    >
                        Сбросить фильтр
                    </button>
                </div>
            )}
            <p className="catalog-footnote">
                Неизвестный лимит остаётся неизвестным. Рекомендация вендора не влияет на медали и
                места в бенчмарках.
            </p>
        </section>
    )
}
