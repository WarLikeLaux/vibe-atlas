"""Build wave-2 reviewed packs from verified proposal cards, keeping every write here."""

import datetime
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
PROPOSALS = ROOT.parents[2] / 'proposals'
CHECKED = datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
IF_WAVE = PROPOSALS / '20261011-instruction-following-wave2'
WEB_WAVE = PROPOSALS / '20261011-web-research-wave2'


def read(path):
    return json.loads(path.read_text())


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=4) + '\n')


def reviews(url, descriptions):
    return [dict(dimension=dimension, status=status, explanation=explanation,
                  sourceUrl=url, checkedAt=CHECKED)
            for dimension, (status, explanation) in descriptions.items()]


def benchmark(identifier, name, context, unit, award, source, method,
              author, purpose, requirements, scoring, assessments):
    return dict(id=identifier, name=name, context=context, unit=unit,
                format='percent', awardEligible=award,
                sourceUrl=source, methodologyUrl=method, checkedAt=CHECKED,
                passport=dict(author=author, purpose=purpose, requirements=requirements,
                              scoring=scoring, reviews=assessments))


def save_pack(identifier, source_id, snapshot, benchmarks, runs, receipts):
    destination = f'data/snapshots/{source_id}/current.json'
    write(ROOT / destination, snapshot)
    digest = hashlib.sha256((ROOT / destination).read_bytes()).hexdigest()
    pack = dict(id=identifier, sourceId=source_id, checkedAt=CHECKED,
                parserVersion='wave2-reviewed-observations/1', snapshotPath=destination,
                snapshotSha256=digest, benchmarks=benchmarks, runs=runs)
    write(ROOT / f'{source_id}.pack.json', pack)
    write(ROOT / f'{source_id}.definitions.json', dict(
        id=identifier, sourceId=source_id, checkedAt=CHECKED,
        parserVersion=pack['parserVersion'], benchmarks=benchmarks,
        mappings=[dict(runId=run['id'], benchmarkId=run['benchmarkId'],
                       **({'modelId': run['modelId']} if 'modelId' in run else {}))
                  for run in runs]))
    write(ROOT / f'{source_id}.receipt.json', dict(
        checkedAt=CHECKED, snapshotPath=destination, snapshotSha256=digest,
        runs=receipts))
    return dict(sourceId=source_id, pack=f'{source_id}.pack.json',
                definitions=f'{source_id}.definitions.json', receipt=f'{source_id}.receipt.json',
                snapshot=destination, snapshotSha256=digest,
                benchmarkCount=len(benchmarks), runCount=len(runs),
                mappedRunCount=sum('modelId' in run for run in runs))


def run(identifier, benchmark_id, source_model, score, label, url, notes, telemetry=None, model=None):
    result = dict(id=identifier, sourceModelName=source_model, benchmarkId=benchmark_id,
                  label=label, score=score, sourceUrl=url, checkedAt=CHECKED, notes=notes,
                  telemetry=telemetry or [], estimated=False)
    if model is not None:
        result['modelId'] = model
    return result


def receipt(item, pointer, config, model_pointer=None, config_pointers=None,
            telemetry_pointers=None, observation_url=None):
    return dict(runId=item['id'], scorePointer=pointer, score=item['score'],
                sourceUrl=item['sourceUrl'], sourceModelName=item['sourceModelName'],
                sourceModelNamePointer=model_pointer,
                observationSourceUrl=observation_url or item['sourceUrl'],
                label=item['label'], notes=item['notes'],
                configuration=config, configurationPointers=config_pointers or {},
                telemetryPointers=telemetry_pointers or [], transformations=[])


def telemetry_entry(name, unit, pointer):
    return dict(name=name, unit=unit, valuePointer=pointer, transformations=[])


EFFORT_SUFFIX = re.compile(r'-(max|xhigh|high|medium|low)$')


def livebench():
    source = 'https://livebench.ai/'
    method = 'https://github.com/LiveBench/LiveBench'
    data = read(IF_WAVE / 'livebench-source-rows.json')
    model_map = {
        'minimax-m3': 'minimax-m3', 'glm-5.3': 'glm-5-3', 'glm-5.3-flash': 'glm-5-3-flash',
        'gemini-3.8-flash-high': 'gemini-3-8-flash', 'muse-spark-1.3-xhigh': 'muse-spark-1-3',
        'gpt-6-astra-max': 'gpt-6-astra', 'grok-4.7-xhigh': 'grok-4-7',
        'gpt-6-luna-max': 'gpt-6-luna', 'gpt-6.1-sol-max': 'gpt-6-1-sol',
        'gpt-6.1-sol-xhigh': 'gpt-6-1-sol',
    }
    metrics = [('paraphrase', 'Paraphrase'), ('simplify', 'Simplify'),
               ('story_generation', 'Story generation'), ('summarize', 'Summarize')]
    assessments = reviews(source, {
        'independence': ('unknown', 'Авторство и спонсор указаны сайтом, происхождение отдельных замеров и связи с тестируемыми вендорами не проверены.'),
        'contamination': ('unknown', 'Заявление LiveBench о снижении загрязнения не является проверкой обучения этих моделей.'),
        'saturation': ('not-reviewed', 'Статистический анализ и интервалы отсутствуют в этой партии.'),
        'reproducibility': ('unknown', 'Числовые файлы открыты, но привязка релиза к commit и параметрам не установлена.'),
        'comparability': ('unknown', 'Категория и релиз общие, effort различается, прочие условия неизвестны.'),
    })
    benchmarks = [benchmark(
        f'livebench:if-{key}', 'LiveBench IF', f'IF · {label} · релиз 2026-06-25',
        '% баллов 0–100', True, source, method, 'LiveBench Team',
        'Ограничения в перефразировании, упрощении, генерации историй и суммаризации.',
        'Релиз LiveBench 2026-06-25, категория IF. Версия harness, temperature, seed и бюджеты строк не раскрыты CSV.',
        'Баллы подзадач на шкале 0–100, выше лучше. По 50 задач каждой IF-подзадачи.', assessments)
        for key, label in metrics]
    snapshot = dict(sourceUrl=source, methodologyUrl=method, checkedAt=CHECKED,
                    kind='reviewed-observations', release='2026-06-25', observations=[])
    runs, receipts = [], []
    for record in data['records']:
        published = record['modelAsPublished']
        assert published in model_map, published
        effort_match = EFFORT_SUFFIX.search(published)
        effort = effort_match.group(1) if effort_match else None
        cost = record['sourceCostFields']
        observation_base = dict(
            sourceModelName=published, effort=effort, sampleSize=200,
            costPerQuestion=float(cost['cost_per_question']),
            costPerSuccessfulTask=float(cost['cost_per_successful_task']),
            avgInputTokens=float(cost['avg_input_tokens']),
            avgOutputTokens=float(cost['avg_output_tokens']))
        for key, _ in metrics:
            score = float(record['sourceScoreFields'][key])
            index = len(snapshot['observations'])
            snapshot['observations'].append(dict(observation_base, metric=key, score=score))
            identifier = f'livebench-if-reviewed-{index + 1}'
            label = f'{published} · effort {effort or "не раскрыт"}'
            notes = ['Релиз 2026-06-25, категория IF. Версия harness и бюджеты строк не раскрыты.',
                     'Стоимость относится ко всему релизу, не только к категории IF.']
            item = run(identifier, f'livebench:if-{key}', published, score, label, source, notes,
                       [{'name': 'Стоимость вопроса', 'value': observation_base['costPerQuestion'], 'unit': 'USD, весь релиз'},
                        {'name': 'Стоимость успешной задачи', 'value': observation_base['costPerSuccessfulTask'], 'unit': 'USD, весь релиз'}],
                       model_map[published])
            runs.append(item)
            receipts.append(receipt(
                item, f'/observations/{index}/score',
                dict(effort=effort, metric=key, sampleSize=200),
                model_pointer=f'/observations/{index}/sourceModelName',
                config_pointers={field: f'/observations/{index}/{field}'
                                 for field in ('effort', 'metric', 'sampleSize')},
                telemetry_pointers=[
                    telemetry_entry('Стоимость вопроса', 'USD, весь релиз', f'/observations/{index}/costPerQuestion'),
                    telemetry_entry('Стоимость успешной задачи', 'USD, весь релиз', f'/observations/{index}/costPerSuccessfulTask')]))
    return save_pack('livebench-if-20260625-reviewed', 'livebench-if-20260625',
                     snapshot, benchmarks, runs, receipts)


def hanifeval():
    source = 'https://www.0hye.com/posts/hanifeval/'
    method = 'https://github.com/developer0hye/llm-evals/blob/main/studies/2026-10-hanifeval/README.md'
    data = read(IF_WAVE / 'hanifeval-results.json')
    assert data['version'] == 'v1.1'
    models = {
        'gpt-6-luna': ('GPT-6 Luna', 'gpt-6-luna', dict(strict=93.2, loose=94.2, istrict=95.1, iloose=95.7, qc=94.1),
                        dict(cost=0.159, reasoning=301.0, visible=426.0)),
        'glm-5.3-flash': ('GLM 5.3 Flash', 'glm-5-3-flash', dict(strict=95.3, loose=97.2, istrict=96.8, iloose=98.1, qc=96.2),
                           dict(cost=0.910, reasoning=3201.0, visible=1008.0)),
    }
    for key, (_, _, expected, _) in models.items():
        row = next(row for row in data['rows']
                   if row['section'].startswith('Overall') and row['fields'].get('Model') == key)
        assert row['fields']['prompt strict [95% CI]'].startswith(str(expected['strict'])), row['fields']
    metrics = [('prompt-strict', 'Prompt strict', 'strict'), ('prompt-loose', 'Prompt loose', 'loose'),
               ('instruction-strict', 'Instruction strict', 'istrict'),
               ('instruction-loose', 'Instruction loose', 'iloose'),
               ('prompt-strict-qc421', 'Prompt strict · quality-controlled n=421', 'qc')]
    assessments = reviews(source, {
        'independence': ('unknown', 'Коммерческие связи не выяснены. Модели GPT-6 участвовали в ревью набора.'),
        'contamination': ('unknown', 'Новый перевод основан на публичном IFEval; canary не доказывает отсутствие обучения.'),
        'saturation': ('supported', 'Автор сообщает о близости к потолку именно выборки пяти моделей.'),
        'reproducibility': ('supported', 'Доступны версии, configs и per-item responses; независимый повтор unknown.'),
        'comparability': ('supported', 'Разделены v1/v1.1 и срезы 429/421; их нельзя смешивать.'),
    })
    benchmarks = [benchmark(
        f'hanifeval:{key}', 'HanIFEval v1.1', f'Корейские ограничения · {label}',
        '% accuracy', True, source, method, 'developer0hye / 0hye',
        'Перевод ограничений IFEval на корейский вместе с аргументами checker.',
        'Авторский runner, reasoning включён, temperature 0, max_tokens=64000, один провайдер без fallback. Версия сервиса не опубликована.',
        'Prompt/instruction strict/loose, проценты, выше лучше. Основной срез 429 prompt, QC-срез 421.', assessments)
        for key, label, _ in metrics]
    snapshot = dict(sourceUrl=source, methodologyUrl=method, checkedAt=CHECKED,
                    kind='reviewed-observations', version='v1.1', observations=[])
    runs, receipts = [], []
    for key, (display, model_id, expected, extra) in models.items():
        for benchmark_key, _, field in metrics:
            score = expected[field]
            sample = 421 if field == 'qc' else 429
            index = len(snapshot['observations'])
            snapshot['observations'].append(dict(
                sourceModelName=display, effort=None, sampleSize=sample, metric=benchmark_key,
                score=score, costUsd=extra['cost'],
                meanReasoningTokens=extra['reasoning'], meanVisibleTokens=extra['visible']))
            identifier = f'hanifeval-reviewed-{index + 1}'
            notes = [f'Срез: {"quality-controlled n=421" if field == "qc" else "основной n=429"}.',
                     'Стоимость оценена автором по историческим list prices, не измеренный расход.']
            item = run(identifier, f'hanifeval:{benchmark_key}', display, score,
                       f'{display} · авторский runner', source, notes,
                       [{'name': 'Стоимость запуска', 'value': extra['cost'], 'unit': 'USD, оценка автора'},
                        {'name': 'Средние reasoning-токены', 'value': extra['reasoning'], 'unit': 'токенов на scored item'},
                        {'name': 'Средние видимые токены', 'value': extra['visible'], 'unit': 'токенов на scored item'}],
                       model_id)
            runs.append(item)
            receipts.append(receipt(
                item, f'/observations/{index}/score',
                dict(effort=None, metric=benchmark_key, sampleSize=sample),
                model_pointer=f'/observations/{index}/sourceModelName',
                config_pointers={field_name: f'/observations/{index}/{field_name}'
                                 for field_name in ('effort', 'metric', 'sampleSize')},
                telemetry_pointers=[
                    telemetry_entry('Стоимость запуска', 'USD, оценка автора', f'/observations/{index}/costUsd'),
                    telemetry_entry('Средние reasoning-токены', 'токенов на scored item', f'/observations/{index}/meanReasoningTokens'),
                    telemetry_entry('Средние видимые токены', 'токенов на scored item', f'/observations/{index}/meanVisibleTokens')]))
    return save_pack('hanifeval-v11-reviewed', 'hanifeval-v11', snapshot, benchmarks, runs, receipts)


def agentif():
    source = 'https://agentif.github.io/'
    method = 'https://github.com/THU-KEG/AgentIF'
    data = read(IF_WAVE / 'agentif-results.json')
    models = {
        '[T]GLM-5.3-Flash': ('glm-5-3-flash', dict(csr=64.43, isr=24.89), 'CSR 64.43 ± 0.19, ISR 24.89 ± 0.37'),
        '[T]GLM-5.3': ('glm-5-3', dict(csr=64.21, isr=27.06), 'CSR 64.21 ± 0.26, ISR 27.06 ± 1.04'),
    }
    for published, (_, expected, _) in models.items():
        row = next(row for row in data['rows'] if row['model'] == published)
        assert row['CSR'].startswith(str(expected['csr'])), row
    assessments = reviews(source, {
        'independence': ('unknown', 'Исполнители названы как команда benchmark, финансирование не выяснено.'),
        'contamination': ('unknown', 'Набор открыт, пересечения с обучением актуальных GLM не проверены.'),
        'saturation': ('not-reviewed', 'Диапазон двух моделей не позволяет оценить весь каталог.'),
        'reproducibility': ('supported', 'Публичные протокол, данные и configs; независимый повтор unknown.'),
        'comparability': ('supported', 'Legacy и current смешивать запрещено авторами; параметры двух GLM одинаковы.'),
    })
    metrics = [('csr', 'CSR · доля выполненных ограничений'), ('isr', 'ISR · доля полностью выполненных инструкций')]
    benchmarks = [benchmark(
        f'agentif:{key}', 'AgentIF', f'Октябрьский протокол 2026 · {label}',
        '%', True, source, method, 'AgentIF Team, THU-KEG',
        'Длинные системные инструкции из агентских сценариев, условия и спецификации инструментов.',
        'Config-driven run.sh, backend API, effort max, temperature 1.0. Judge gpt-5.6-luna, effort medium. Версия API snapshot не опубликована.',
        'CSR и ISR, проценты, выше лучше. 707 инструкций, три независимых samples.', assessments)
        for key, label in metrics]
    snapshot = dict(sourceUrl=source, methodologyUrl=method, checkedAt=CHECKED,
                    kind='reviewed-observations', protocol='October 2026 setting', observations=[])
    runs, receipts = [], []
    for published, (model_id, expected, dispersion) in models.items():
        for benchmark_key, _ in metrics:
            score = expected[benchmark_key]
            index = len(snapshot['observations'])
            snapshot['observations'].append(dict(
                sourceModelName=published, effort='max', sampleSize=707,
                metric=benchmark_key, score=score))
            identifier = f'agentif-reviewed-{index + 1}'
            notes = [f'Разброс трёх запусков: {dispersion}. Знак ± это sample std, не CI.',
                     'Шесть breakdown-подметрик сохранены в снимке предложения, не отдельные замеры.']
            item = run(identifier, f'agentif:{benchmark_key}', published, score,
                       f'{published} · effort max', source, notes, model=model_id)
            runs.append(item)
            receipts.append(receipt(
                item, f'/observations/{index}/score',
                dict(effort='max', metric=benchmark_key, sampleSize=707),
                model_pointer=f'/observations/{index}/sourceModelName',
                config_pointers={field: f'/observations/{index}/{field}'
                                 for field in ('effort', 'metric', 'sampleSize')}))
    return save_pack('agentif-202610-reviewed', 'agentif-202610', snapshot, benchmarks, runs, receipts)


def mercor_rows(path):
    data = read(path)
    found = []

    def visit(node):
        if isinstance(node, dict):
            if 'leaderboardData' in node and isinstance(node['leaderboardData'], list):
                found.append(node['leaderboardData'])
            for value in node.values():
                visit(value)
        elif isinstance(node, list):
            for value in node:
                visit(value)

    visit(data)
    assert len(found) == 1
    return found[0]


def browsecomp():
    source = 'https://www.mercor.com/apex/oss-benchmarks/oss-browsecomp-leaderboard/'
    method = 'https://openai.com/index/browsecomp/'
    rows = mercor_rows(WEB_WAVE / 'evidence/mercor-browsecomp.json')
    wanted = {
        'gpt-6-1-sol': ('GPT-6.1 Sol', 'gpt-6-1-sol'), 'gpt-6-astra': ('GPT-6 Astra', 'gpt-6-astra'),
        'gpt-6-luna': ('GPT-6 Luna', 'gpt-6-luna'), 'gemini-3.8-flash': ('Gemini 3.8 Flash', 'gemini-3-8-flash'),
        'grok-4.7': ('Grok 4.7', 'grok-4-7'), 'minimax-m3': ('MiniMax-M3', 'minimax-m3'),
        'gpt-6-sol': ('GPT-6 Sol', None),
    }
    by_id = {row['model_id']: row for row in rows}
    assert set(wanted) <= set(by_id), set(wanted) - set(by_id)
    assessments = reviews(source, {
        'independence': ('supported', 'Mercor атрибутирован исполнителем по оригинальной таблице; финансирование unknown.'),
        'contamination': ('unknown', 'Canary авторов не доказывает отсутствие обучения или получения эталона через сеть.'),
        'saturation': ('not-reviewed', 'Высокие баллы на подвыборке не подтверждают насыщение полного BrowseComp.'),
        'reproducibility': ('unknown', 'Исходный код доступен, но подвыборка, агент и judge замера Mercor не установлены.'),
        'comparability': ('unknown', 'Нельзя сравнивать с полными 1 266 задачами и другими протоколами без сверки split.'),
    })
    benchmarks = [benchmark(
        'browsecomp:mercor130-pass1', 'BrowseComp', 'Mercor · 130 публичных задач · Pass@1',
        '% Pass@1', True, source, method, 'OpenAI / замер Mercor',
        'Последовательный поиск трудно находимого факта в открытой сети.',
        'Исследовательский агент Mercor, версия неизвестна. Полный BrowseComp содержит 1 266 задач; выбраны 130, список неизвестен.',
        'Pass@1, %, выше лучше.', assessments)]
    snapshot = dict(sourceUrl=source, methodologyUrl=method, checkedAt=CHECKED,
                    kind='reviewed-observations', protocol='oss-browsecomp, 130 public tasks',
                    observations=[])
    runs, receipts = [], []
    for row_id, (display, model_id) in wanted.items():
        row = by_id[row_id]
        score = float(row['score']['pass-1'])
        error = float(row['error']['pass-1'])
        samples = int(row['n_samples'])
        effort = row['effort']
        index = len(snapshot['observations'])
        snapshot['observations'].append(dict(
            sourceModelName=f'{display} (Mercor) {effort}', effort=effort,
            sampleSize=130, score=score, error=error, nSamples=samples))
        identifier = f'browsecomp-reviewed-{index + 1}'
        notes = [f'Подвыборка 130 из 1 266 задач, точный список неизвестен. n_samples={samples}.',
                 'Поле error сохранено без пересчёта; уровень и метод неизвестны, это не 95% CI.',
                 'Замер Mercor нельзя считать запуском через пользовательский агент.']
        item = run(identifier, 'browsecomp:mercor130-pass1', f'{display} (Mercor) {effort}',
                   score, f'{display} · Mercor · effort {effort}', source, notes,
                   [{'name': 'Опубликованная погрешность', 'value': error, 'unit': 'процентных пункта; метод неизвестен'},
                    {'name': 'Образцы', 'value': float(samples), 'unit': 'n_samples'}],
                   model_id)
        runs.append(item)
        receipts.append(receipt(
            item, f'/observations/{index}/score',
            dict(effort=effort, sampleSize=130),
            model_pointer=f'/observations/{index}/sourceModelName',
            config_pointers={field: f'/observations/{index}/{field}'
                             for field in ('effort', 'sampleSize')},
            telemetry_pointers=[
                telemetry_entry('Опубликованная погрешность', 'процентных пункта; метод неизвестен', f'/observations/{index}/error'),
                telemetry_entry('Образцы', 'n_samples', f'/observations/{index}/nSamples')]))
    return save_pack('browsecomp-mercor130-reviewed', 'browsecomp-mercor130',
                     snapshot, benchmarks, runs, receipts)


def deepsearchqa():
    source = 'https://parallel.ai/leaderboard'
    method = 'https://parallel.ai/leaderboard#methodology'
    data = read(WEB_WAVE / 'evidence/parallel-search-capability.json')
    wanted = {
        'gpt-6.1-sol__with-search': ('GPT-6.1 Sol', 'gpt-6-1-sol'),
        'gpt-6-astra__with-search': ('GPT-6 Astra', 'gpt-6-astra'),
        'gpt-6-luna__with-search': ('GPT-6 Luna', 'gpt-6-luna'),
        'z-ai/glm-5.3-openrouter__with-search': ('GLM 5.3', 'glm-5-3'),
        'z-ai/glm-5.3-flash__with-search': ('GLM 5.3 Flash', 'glm-5-3-flash'),
        'google/gemini-3.8-flash__with-search': ('Gemini 3.8 Flash', 'gemini-3-8-flash'),
        'minimax/minimax-m3__with-search': ('MiniMax-M3', 'minimax-m3'),
        'meta/muse-spark-1.3__with-search': ('Muse Spark 1.3', 'muse-spark-1-3'),
    }
    by_id = {record['id']: record for record in data['records']}
    assert set(wanted) <= set(by_id), set(wanted) - set(by_id)
    assessments = reviews(source, {
        'independence': ('supported', 'Замер поставщика поискового инструмента Parallel, не безусловно независимый эксперимент.'),
        'contamination': ('unknown', 'Overlap с обучением и запрет нахождения эталонов не проверялись.'),
        'saturation': ('not-reviewed', 'F1 с частичным зачётом не равен доле полностью правильных ответов.'),
        'reproducibility': ('unknown', 'Подвыборка, harness, judge и бюджеты Parallel не установлены.'),
        'comparability': ('unknown', 'Нельзя смешивать с полной таблицей Kaggle или другим агентом.'),
    })
    benchmarks = [benchmark(
        'deepsearchqa:parallel100-f1', 'DeepSearchQA', 'Parallel · 100 вопросов · with-search · F1',
        'F1 0–100', True, source, method, 'Google DeepMind и др. / замер Parallel',
        'Многошаговый поиск, полный сбор списка ответов, устранение повторов и проверка условий.',
        'Harness Parallel с Parallel Search Fast и Extract. Подвыборка 100 из 900 запросов, ревизия неизвестна.',
        'F1 на шкале 0–100, выше лучше. Контрольный режим without-search в пакет не входит.', assessments)]
    snapshot = dict(sourceUrl=source, methodologyUrl=method, checkedAt=CHECKED,
                    kind='reviewed-observations', protocol='Parallel Search Capability, DSQA subset',
                    observations=[])
    runs, receipts = [], []
    for record_id, (display, model_id) in wanted.items():
        record = by_id[record_id]
        score = float(record['dsqa'])
        ntasks = int(record['nTasks']['DSQA'])
        index = len(snapshot['observations'])
        snapshot['observations'].append(dict(
            sourceModelName=f'{display} (Parallel) with-search', effort=None,
            sampleSize=100, score=score, nTasksDsqa=ntasks))
        identifier = f'deepsearchqa-reviewed-{index + 1}'
        notes = [f'nTasks.DSQA={ntasks} при плановых 100; правила источника считают failed нулями.',
                 'Опубликованные стоимость и время относятся к смеси DSQA/HLE/WISER и на этот запуск не переносятся.']
        item = run(identifier, 'deepsearchqa:parallel100-f1', f'{display} (Parallel) with-search',
                   score, f'{display} · Parallel with-search', source, notes,
                   [{'name': 'Задачи DSQA', 'value': float(ntasks), 'unit': 'nTasks'}],
                   model_id)
        runs.append(item)
        receipts.append(receipt(
            item, f'/observations/{index}/score',
            dict(effort=None, sampleSize=100),
            model_pointer=f'/observations/{index}/sourceModelName',
            config_pointers={field: f'/observations/{index}/{field}'
                             for field in ('effort', 'sampleSize')},
            telemetry_pointers=[
                telemetry_entry('Задачи DSQA', 'nTasks', f'/observations/{index}/nTasksDsqa')]))
    return save_pack('deepsearchqa-parallel100-reviewed', 'deepsearchqa-parallel100',
                     snapshot, benchmarks, runs, receipts)


def drb2():
    source = 'https://www.mercor.com/apex/oss-benchmarks/oss-deepresearch-bench-ii-leaderboard/'
    method = 'https://arxiv.org/html/2601.08536v3'
    rows = mercor_rows(WEB_WAVE / 'evidence/mercor-deepresearch-bench-ii.json')
    wanted = {
        'gpt-6-astra': ('GPT-6 Astra', 'gpt-6-astra'), 'gpt-6-luna': ('GPT-6 Luna', 'gpt-6-luna'),
        'glm-5-3': ('GLM-5.3', 'glm-5-3'), 'grok-4.7': ('Grok 4.7', 'grok-4-7'),
        'gpt-6-sol': ('GPT-6 Sol', None),
    }
    by_id = {row['model_id']: row for row in rows}
    assert set(wanted) <= set(by_id), set(wanted) - set(by_id)
    assessments = reviews(source, {
        'independence': ('supported', 'Авторы теста и Mercor разделены по двум оригиналам; финансирование unknown.'),
        'contamination': ('supported', 'Статья описывает blocked list; соблюдение запрета современными моделями unknown.'),
        'saturation': ('not-reviewed', 'Вывод статьи о моделях её периода не переносится на новые модели.'),
        'reproducibility': ('supported', 'Официальный код и рубрики доступны; воспроизведение Mercor unknown.'),
        'comparability': ('unknown', '130/9 287 и авторские 132/9 430 не смешиваются; judge Mercor не установлен.'),
    })
    benchmarks = [benchmark(
        'drb2:mercor130-mean-score', 'DeepResearch Bench II', 'Mercor · 130 задач · Mean Score',
        '% Mean Score', True, source, method, 'USTC/Metastone / замер Mercor',
        'Длинный исследовательский отчёт: поиск, анализ и представление по экспертным рубрикам.',
        'Агент Mercor, версия и judge неизвестны. Оригинал: 132 задачи и 9 430 рубрик; у Mercor 130 и 9 287.',
        'Активна Mean Score, %, выше лучше. Нули неактивного Pass@1 оценкой не считаются.', assessments)]
    snapshot = dict(sourceUrl=source, methodologyUrl=method, checkedAt=CHECKED,
                    kind='reviewed-observations', protocol='oss-deepresearch-bench-ii, 130 tasks',
                    observations=[])
    runs, receipts = [], []
    for row_id, (display, model_id) in wanted.items():
        row = by_id[row_id]
        score = float(row['score']['mean-score'])
        error = float(row['error']['mean-score'])
        samples = int(row['n_samples'])
        effort = row['effort']
        index = len(snapshot['observations'])
        snapshot['observations'].append(dict(
            sourceModelName=f'{display} (Mercor) {effort}', effort=effort,
            sampleSize=130, score=score, error=error, nSamples=samples))
        identifier = f'drb2-reviewed-{index + 1}'
        notes = ['Авторские Gemini-2.5 и GPT-5.5 Text-only Eval — отдельные протоколы, в пакет не входят.',
                 'Поле error сохранено без пересчёта; уровень и метод неизвестны.']
        item = run(identifier, 'drb2:mercor130-mean-score', f'{display} (Mercor) {effort}',
                   score, f'{display} · Mercor · effort {effort}', source, notes,
                   [{'name': 'Опубликованная погрешность', 'value': error, 'unit': 'процентных пункта; метод неизвестен'},
                    {'name': 'Образцы', 'value': float(samples), 'unit': 'n_samples'}],
                   model_id)
        runs.append(item)
        receipts.append(receipt(
            item, f'/observations/{index}/score',
            dict(effort=effort, sampleSize=130),
            model_pointer=f'/observations/{index}/sourceModelName',
            config_pointers={field: f'/observations/{index}/{field}'
                             for field in ('effort', 'sampleSize')},
            telemetry_pointers=[
                telemetry_entry('Опубликованная погрешность', 'процентных пункта; метод неизвестен', f'/observations/{index}/error'),
                telemetry_entry('Образцы', 'n_samples', f'/observations/{index}/nSamples')]))
    return save_pack('drb2-mercor130-reviewed', 'drb2-mercor130',
                     snapshot, benchmarks, runs, receipts)


SUMMARY = [livebench(), hanifeval(), agentif(), browsecomp(), deepsearchqa(), drb2()]
write(ROOT / 'manifest.json', dict(checkedAt=CHECKED, packs=SUMMARY))
print(json.dumps(SUMMARY, ensure_ascii=False, indent=1))
