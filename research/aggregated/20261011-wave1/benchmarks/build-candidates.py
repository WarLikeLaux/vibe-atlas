"""Produce review-only candidates, keeping every write in this handoff folder."""

import datetime
import hashlib
import json
import re
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).parent
PROPOSALS = ROOT.parents[2] / 'proposals'
CHECKED = datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')


def read(path):
    return json.loads(path.read_text())


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=4) + '\n')


def download(url):
    return urllib.request.urlopen(url, timeout=30).read()


def reviews(url, descriptions):
    return [dict(dimension=dimension, status=status, explanation=explanation,
                 sourceUrl=url, checkedAt=CHECKED)
            for dimension, (status, explanation) in descriptions.items()]


def benchmark(identifier, name, context, unit, percent, award, source, method,
              author, purpose, requirements, scoring, assessments):
    return dict(id=identifier, name=name, context=context, unit=unit,
                format='percent' if percent else 'number', awardEligible=award,
                sourceUrl=source, methodologyUrl=method, checkedAt=CHECKED,
                passport=dict(author=author, purpose=purpose, requirements=requirements,
                              scoring=scoring, reviews=assessments))


def save_pack(identifier, source_id, snapshot, benchmarks, runs, receipts):
    destination = f'data/snapshots/{source_id}/current.json'
    write(ROOT / destination, snapshot)
    digest = hashlib.sha256((ROOT / destination).read_bytes()).hexdigest()
    pack = dict(id=identifier, sourceId=source_id, checkedAt=CHECKED,
                parserVersion='wave1-reviewed-observations/1', snapshotPath=destination,
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
                snapshot=destination, destinationSnapshot=destination,
                snapshotSha256=digest, benchmarkCount=len(benchmarks), runCount=len(runs),
                mappedRunCount=sum('modelId' in run for run in runs))


def run(identifier, benchmark_id, source_model, score, label, url, notes, telemetry=None, model=None):
    result = dict(id=identifier, sourceModelName=source_model, benchmarkId=benchmark_id,
                  label=label, score=score, sourceUrl=url, checkedAt=CHECKED, notes=notes,
                  telemetry=telemetry or [], estimated=False)
    if model is not None:
        result['modelId'] = model
    return result


def receipt(item, pointer, config, transformations=None, model_pointer=None,
            config_pointers=None, telemetry_pointers=None, observation_url=None):
    return dict(runId=item['id'], scorePointer=pointer, score=item['score'],
                sourceUrl=item['sourceUrl'], sourceModelName=item['sourceModelName'],
                sourceModelNamePointer=model_pointer,
                observationSourceUrl=observation_url or item['sourceUrl'],
                label=item['label'], notes=item['notes'],
                configuration=config, configurationPointers=config_pointers or {},
                telemetryPointers=telemetry_pointers or [],
                transformations=transformations or [])


class Tables(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tables = []
        self.table = None
        self.row = None
        self.cell = None

    def handle_starttag(self, tag, attrs):
        if tag == 'table':
            self.table = []
        elif tag == 'tr' and self.table is not None:
            self.row = []
        elif tag in ('th', 'td') and self.row is not None:
            self.cell = []

    def handle_data(self, data):
        if self.cell is not None:
            self.cell.append(data)

    def handle_endtag(self, tag):
        if tag in ('th', 'td') and self.cell is not None:
            self.row.append(' '.join(''.join(self.cell).split()))
            self.cell = None
        elif tag == 'tr' and self.row is not None:
            self.table.append(self.row)
            self.row = None
        elif tag == 'table' and self.table is not None:
            self.tables.append(self.table)
            self.table = None


def swe_pro_hard():
    source = 'https://labs.scale.com/leaderboard/swe_bench_pro_public_v2'
    method = 'https://raw.githubusercontent.com/scaleapi/SWE-bench_Pro-os/main/v2/README.md'
    evidence = read(PROPOSALS / '20261011-coding-benchmarks-wave1/evidence/swe-pro-v2-variants.json')
    rows = evidence[1]['entries']
    # Exact visible HARD results independently read from the primary page by web.
    visible = [98, 92.2, 90.2, 88.2, 88.2, 86.3, 84.3, 82.4, 58.8, 56.9, 52.94, 25.5]
    assert [row['score'] for row in rows] == visible
    model_map = {
        'Fable 5.1': 'claude-fable-5-1', 'GPT-6 Astra': 'gpt-6-astra',
        'Kimi-K3': 'kimi-k3', 'GPT-5.6 Terra': 'gpt-5-6-terra',
        'GLM-5.3': 'glm-5-3', 'Gemini 3.8 Flash': 'gemini-3-8-flash',
        'Haiku 5.5': 'claude-haiku-5-5',
    }
    snapshot = dict(sourceUrl=source, checkedAt=CHECKED,
                    kind='primary-page-observations-with-earlier-extraction',
                    methodologyUrl=method, observations=[],
                    earlierArtifact='research/proposals/20261011-coding-benchmarks-wave1/evidence/swe-pro-v2-variants.json',
                    verification='All 12 HARD scores and model labels checked against the visible primary table. Earlier source fields are retained separately, not independently re-fetched.',
                    corrections=['Haiku 5.5 currently displays ±13.01. Earlier extraction has confidenceInterval_upper=0; that zero is not interpreted as its uncertainty.'])
    assessments = reviews(source, {
        'independence': ('unknown', 'Scale и Reflection разработали V2 совместно. Финансирование и независимый повтор этих замеров не проверены.'),
        'contamination': ('unknown', 'V2 заявляет изоляцию сети и повторную проверку patch. Trusted relay и исполняемый код patch остаются ограничениями. Пересечение с обучением не проверено.'),
        'saturation': ('not-reviewed', 'HARD выбран по провалам нескольких семейств. Разброс оценок не доказывает статистическую различимость всех моделей.'),
        'reproducibility': ('unknown', 'Публичный V2 README даёт набор и процедуру. Версии агентов и выполнение именно этого протокола каждым замером не подтверждены.'),
        'comparability': ('disputed', 'HARD-51 отделён от Full. V2 README указывает 50 минут, страница также содержит старые лимиты 250 turns. Агенты разделены по столбцам, условия строк не полностью проверены.'),
    })
    benchmarks = []
    for agent, suffix in [('Claude Code', 'claude-code'), ('Codex', 'codex'), ('mini-swe-agent', 'mini-swe-agent')]:
        benchmarks.append(benchmark(
            f'swe-pro:v2-hard51-{suffix}', 'SWE-Bench Pro V2 HARD', f'HARD-51 · {agent}',
            '% Pass@1', True, agent != 'Claude Code', source, method, 'Scale AI / Reflection',
            'Исправление задач репозиториев. HARD-51 является отобранным поднабором V2.',
            f'Заявленный locked protocol V2, HARD-51, агент {agent}. Точная версия агента неизвестна. Требования README не подтверждают условия каждой строки.',
            'Опубликованный Pass@1, проценты 0–100. 51 задача. Число попыток и уровень показанного интервала отдельно не установлены.', assessments))
    runs, receipts = [], []
    for index, row in enumerate(rows):
        match = re.fullmatch(r'(.+?) \((.+?)\) (\w+)\s*', row['model'])
        assert match is not None
        model_name, agent, effort = match.groups()
        suffix = {'Claude Code': 'claude-code', 'Codex': 'codex', 'mini-swe-agent': 'mini-swe-agent'}[agent]
        item = dict(sourceModelName=row['model'], score=row['score'], agent=agent,
                    effort=effort, agentVersion=None, sampleSize=51, unit='percent',
                    displayedUncertainty=13.01 if model_name == 'Haiku 5.5' else None,
                    displayedUncertaintyUnit='percentage-points', uncertaintyLevel=None,
                    earlierSourceFields=row)
        snapshot['observations'].append(item)
        identifier = f'swe-pro-hard51-reviewed-{index+1}'
        notes = ['Версия агента неизвестна. Время измерения неизвестно.',
                 'HARD-51 не является независимым набором от Full V2.',
                 'Ранг из источника не переносится. Нули старого поля confidenceInterval_upper не являются подтверждением нулевой неопределённости.',
                 'Заявленные locked-условия не подтверждены отдельно для каждой строки. Страница содержит также исторические лимиты.']
        telemetry = []
        if item['displayedUncertainty'] is not None:
            notes.append('Страница сейчас показывает ±13.01 для Haiku 5.5, старое извлечение содержало 0. Метод и уровень интервала неизвестны.')
            telemetry.append(dict(name='Показанная неопределённость (уровень неизвестен)', value=13.01, unit='percentage-points'))
        result = run(identifier, f'swe-pro:v2-hard51-{suffix}', row['model'], row['score'],
                     f'{agent} · {effort}', source, notes, telemetry, model_map.get(model_name))
        runs.append(result)
        receipts.append(receipt(result, f'/observations/{index}/score',
                                dict(agent=agent, agentVersion=None, effort=effort,
                                     sampleSize=51, sourceUnit='percent', sourceModel=model_name),
                                model_pointer=f'/observations/{index}/sourceModelName',
                                config_pointers={field: f'/observations/{index}/{field}'
                                                 for field in ['agent', 'agentVersion', 'effort', 'sampleSize']},
                                telemetry_pointers=[dict(name=entry['name'], unit=entry['unit'],
                                                         valuePointer=f'/observations/{index}/displayedUncertainty',
                                                         transformations=[]) for entry in telemetry]))
    return save_pack('swe-bench-pro-v2-hard51-reviewed', 'swe-pro-v2-hard51', snapshot, benchmarks, runs, receipts)


def programbench():
    source = 'https://programbench.com/'
    content = download(source)
    html = content.decode()
    match = re.search(r'var results\s*=\s*(\[)', html)
    assert match is not None
    plot, _ = json.JSONDecoder().raw_decode(html[match.start(1):])
    table_parser = Tables()
    table_parser.feed(html)
    prior_plot = read(PROPOSALS / '20261011-coding-benchmarks-wave1/evidence/programbench-results.json')
    assert plot == prior_plot
    prior_table = read(PROPOSALS / '20261011-coding-benchmarks-wave1/evidence/programbench-tables.json')
    # Both extractors retain the same cells, but separate inline tags differently.
    canonical = lambda tables: [[[''.join(cell.split()) for cell in row] for row in table]
                                for table in tables]
    assert canonical(table_parser.tables) == canonical(prior_table)
    snapshot = dict(sourceUrl=source, checkedAt=CHECKED, responseSha256=hashlib.sha256(content).hexdigest(),
                    kind='embedded-json-and-html-tables', plotRows=plot,
                    tables=table_parser.tables, publishedTaskCount=200,
                    runPageNotes={'max': '200 solutions, 200 instances', 'xhigh': '199 solutions, 200 instances, one n/a'},
                    limitations=['Model API IDs, exact harness revision, budgets and aggregate treatment of n/a are unknown.'])
    assessments = reviews(source, {
        'independence': ('supported', 'Среди авторов названа Meta Superintelligence Labs. Измерение Muse не считается независимым от Meta.'),
        'contamination': ('unknown', 'Сайт описывает запреты сети и декомпиляции. Знание публичных исходников при обучении не проверено.'),
        'saturation': ('not-reviewed', 'Полный аудит различимости не выполнен. Низкий Resolved не доказывает отсутствие насыщения других метрик.'),
        'reproducibility': ('unknown', 'Программы и артефакты доступны по ссылкам. Точная версия harness, бюджеты и собственный повтор неизвестны.'),
        'comparability': ('unknown', '200 задач заявлены для таблицы. У xhigh 199 solutions и 200 строк. Правило обработки n/a и знаменатель агрегатов не уточнены.'),
    })
    metrics = [
        ('resolved', 'Resolved', '% Resolved', True, 'Все behavioral tests задачи должны пройти.'),
        ('almost', 'Almost Resolved', '% Almost Resolved', True, 'Не менее 95% behavioral tests задачи должны пройти.'),
        ('behavioral', 'Behavioral Test Pass Rate', 'fraction', False, 'Исходная дробь 0–1 из embedded results, не приблизительное чтение графика.'),
    ]
    benchmarks = [benchmark(
        f'programbench:200-mini-swe-{metric}', f'ProgramBench · {name}', '200 задач · mini-SWE-agent',
        unit, percent, False, source, source, 'Meta Superintelligence Labs / Stanford / Harvard',
        'Реализация программы заново по исполняемому binary и документации.',
        '200 задач, mini-SWE-agent, сеть и декомпиляция запрещены. Версия агента и бюджеты запуска неизвестны.',
        scoring + ' Источник публикует агрегат, знаменатель xhigh не подтверждён отдельно.', assessments)
        for metric, name, unit, percent, scoring in metrics]
    runs, receipts = [], []
    for effort in ['max', 'xhigh']:
        model_name = f'Muse Spark 1.3 ({effort})'
        plot_index = next(i for i, item in enumerate(plot) if item['model'] == model_name)
        table_index = next(i for i, row in enumerate(table_parser.tables[0]) if len(row) > 2 and row[2] == model_name)
        row = table_parser.tables[0][table_index]
        plot_row = plot[plot_index]
        run_source = f'https://programbench.com/run/muse-spark-1-3-{effort}/'
        telemetry = [dict(name='Опубликованная средняя API-стоимость', value=plot_row['cost'], unit='USD/task'),
                     dict(name='Опубликованные средние вызовы', value=plot_row['calls'], unit='calls/task'),
                     dict(name='Поле tokens графика (состав и знаменатель неизвестны)', value=plot_row['tokens'], unit='tokens')]
        for metric, _, _, _, _ in metrics:
            if metric == 'behavioral':
                score = plot_row['score']
                pointer = f'/plotRows/{plot_index}/score'
                transformations = []
            else:
                column = 4 if metric == 'resolved' else 5
                score = float(row[column].replace('%', '').strip())
                pointer = f'/tables/0/{table_index}/{column}'
                transformations = ['strip-percent-sign-and-whitespace-parse-number']
            notes = ['Обычный Muse Spark 1.3. Contributor источником не указан и не получает этот результат.',
                     'Версия mini-SWE-agent, точные бюджеты, интервал и время замера не проверены.',
                     'Две effort-конфигурации и три метрики относятся к связанным запускам, не являются независимыми подтверждениями.',
                     'В текущем каталоге у теста одна точно сопоставленная модель, награды отключены.']
            if effort == 'xhigh':
                notes.append('Источник показывает 199 solutions при 200 instances, есть n/a. Агрегаты сохранены без собственного пересчёта знаменателя.')
            result = run(f'programbench-muse-1-3-{effort}-{metric}', f'programbench:200-mini-swe-{metric}',
                         model_name, score, f'mini-SWE-agent · {effort}', run_source, notes,
                         telemetry, 'muse-spark-1-3')
            runs.append(result)
            receipts.append(receipt(result, pointer, dict(agent='mini-SWE-agent', agentVersion=None,
                effort=effort, publishedTaskCount=200, denominator=None, sourceUnit='fraction' if metric == 'behavioral' else 'percent'), transformations,
                model_pointer=f'/plotRows/{plot_index}/model',
                config_pointers={'agent': f'/tables/0/{table_index}/3', 'publishedTaskCount': '/publishedTaskCount'},
                telemetry_pointers=[dict(name=entry['name'], unit=entry['unit'],
                                         valuePointer=f'/plotRows/{plot_index}/{field}', transformations=[])
                                    for entry, field in zip(telemetry, ['cost', 'calls', 'tokens'])],
                observation_url=source))
    return save_pack('programbench-200-reviewed', 'programbench', snapshot, benchmarks, runs, receipts)


def slopcode():
    source = 'https://raw.githubusercontent.com/michaelasper/benchmarks/main/data/glm-5.3-pi-xhigh-2026-08-19/result.json'
    method = 'https://raw.githubusercontent.com/michaelasper/benchmarks/main/data/glm-5.3-pi-xhigh-2026-08-19/README.md'
    content = download(source)
    aggregate = json.loads(content)
    assert aggregate == read(PROPOSALS / '20261011-developer-media-wave1/evidence/slopcode-aggregate.json')
    snapshot = dict(sourceUrl=source, checkedAt=CHECKED, responseSha256=hashlib.sha256(content).hexdigest(),
                    aggregate=aggregate, publishedConfiguration=dict(
                        model='openrouter/z-ai/glm-5.3', agent='pi', agentVersion='0.84.2', effort='xhigh',
                        prompt='just-solve', seed=42, evaluation='all-cases',
                        benchmarkVersion='SlopCodeBench v1.0', catalogueRevision='4d38d300059667d57e43c31969bc455f5c338b52',
                        attemptTimeoutSeconds=7200, environment='Python 3.12 Docker'),
                    configurationSourceUrl=method,
                    limitations=['Runner revision and dirty runtime changes are not pinned. 14 continuations and 12 evaluations without prior tests affect strict comparability. Checkpoint records not downloaded.'])
    assessments = reviews(method, {
        'independence': ('unknown', 'Замер публикует michaelasper. Связи и финансирование относительно Z.ai не установлены.'),
        'contamination': ('not-reviewed', 'Пересечение с обучением и доступ к эталонам не проверены.'),
        'saturation': ('unknown', 'Одна конфигурация не позволяет оценить насыщение.'),
        'reproducibility': ('unknown', 'Aggregate и конфигурация доступны. Runtime revision не закреплён, условия продолжений не полностью воспроизводимы. Собственного повтора не было.'),
        'comparability': ('unknown', 'Checkpoints зависимы, есть продолжения и проверки без prior tests. Strict, isolated и core разделены, сторонние сравнения не импортированы.'),
    })
    metrics = [
        ('strict', 'Strict checkpoints', 'pct_checkpoints_solved', 'checkpoints_solved', 196),
        ('isolated', 'Isolated checkpoints', 'pct_checkpoints_iso_solved', 'checkpoints_iso_solved', 196),
        ('core', 'Core checkpoints', 'pct_checkpoints_core_solved', 'checkpoints_core_solved', 196),
        ('problems', 'Fully solved problems', 'pct_problems_solved', 'problem_solved', 36),
        ('partial', 'Problems with a strict pass', 'pct_problems_partial', 'problem_partial', 36),
    ]
    benchmarks, runs, receipts = [], [], []
    for metric, label, field, numerator, denominator in metrics:
        identifier = f'slopcode:v1-pi-0-84-2-{metric}'
        benchmarks.append(benchmark(identifier, f'SlopCodeBench · {label}', 'v1.0 · pi 0.84.2 · один замер',
            f'% {label}', True, False, source, method, 'SlopCodeBench / замер michaelasper',
            'Последовательное развитие программ через зависимые checkpoints.',
            'Каталог v1.0, 36 problems, 196 checkpoints. Pi 0.84.2, xhigh, just-solve, seed 42, Python 3.12 Docker. Timeout попытки 7200 секунд.',
            f'Опубликованное поле {field}, проценты 0–100. Наблюдение {aggregate[numerator]}/{denominator}. Эта метрика не подменяет остальные проверки.', assessments))
        notes = ['Точная модель openrouter/z-ai/glm-5.3, обычный GLM-5.3.',
                 '14 продолжений после неуспешной попытки, 12 evaluations без prior tests. Условия не эквивалентны чистому непрерывному прогону.',
                 'Runner revision и dirty-runtime правка неизвестны. Checkpoint records и trajectories не проверены.',
                 'Одна модель и один прогон, награды отключены. Категории токенов не складываются.']
        result = run(f'slopcode-glm-5-3-pi-xhigh-{metric}', identifier, 'openrouter/z-ai/glm-5.3',
            aggregate[field], 'pi 0.84.2 · xhigh · just-solve', source, notes,
            [dict(name='Опубликованная стоимость всего запуска', value=aggregate['costs']['total'], unit='USD/run'),
             dict(name='Полностью пройдено в данной метрике', value=aggregate[numerator], unit='checkpoints' if denominator == 196 else 'problems')],
            'glm-5-3')
        runs.append(result)
        receipts.append(receipt(result, f'/aggregate/{field}', snapshot['publishedConfiguration'],
            model_pointer='/publishedConfiguration/model',
            config_pointers={field: f'/publishedConfiguration/{field}' for field in snapshot['publishedConfiguration']},
            telemetry_pointers=[dict(name=entry['name'], unit=entry['unit'], valuePointer=pointer, transformations=[])
                                for entry, pointer in zip(result['telemetry'], ['/aggregate/costs/total', f'/aggregate/{numerator}'])]))
    return save_pack('slopcode-v1-glm-5-3-pi-reviewed', 'slopcode', snapshot, benchmarks, runs, receipts)


if __name__ == '__main__':
    manifests = [swe_pro_hard(), programbench(), slopcode()]
    write(ROOT / 'manifest.json', dict(checkedAt=CHECKED, status='reviewed-candidates', packs=manifests,
        excluded=['SWE-Pro V2 Full, Private, harness-study: independent fetch unavailable',
                  'SWE-rebench: exact boundary/denominator and conditional agent-model mapping not verified',
                  'LiveCodeBench, Aider, BigCodeBench, EvalPlus, official SWE-bench: no exact current catalogue rows found in checked scope']))
    print(json.dumps(manifests, ensure_ascii=False, indent=2))
