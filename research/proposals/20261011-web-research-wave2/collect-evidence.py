"""Public evidence capture for this proposal only. No catalog writes or API evals."""

import hashlib
import json
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "evidence"
OUT.mkdir(exist_ok=True)
manifest = []


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        body = response.read()
    stamp = datetime.now(timezone.utc).isoformat(timespec="seconds")
    return body, stamp


def save(name, body, url, stamp, method, response_sha):
    (OUT / name).write_bytes(body)
    manifest.append({
        "path": "evidence/" + name,
        "source_url": url,
        "retrieved_at": stamp,
        "verified_at": stamp,
        "extraction": method,
        "response_sha256": response_sha,
        "artifact_sha256": hashlib.sha256(body).hexdigest(),
    })


def encode(value):
    return (json.dumps(value, ensure_ascii=False, indent=4) + "\n").encode()


for key, segment in [
    ("browsecomp", "oss-benchmarks/oss-browsecomp-leaderboard"),
    ("browsecomp-extended", "mercor-extended/ots-held-out-browsecomp-leaderboard"),
    ("deepresearch-bench-ii", "oss-benchmarks/oss-deepresearch-bench-ii-leaderboard"),
]:
    url = "https://www.mercor.com/apex/" + segment + "/"
    body, stamp = fetch(url)
    match = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', body.decode(), re.S)
    if match is None:
        raise ValueError("Missing public Next.js data: " + key)
    props = json.loads(match.group(1))["props"]["pageProps"]
    # Preserve every published numeric/configuration field and all leaderboard rows.
    # Omit sample prompts, page SEO and presentation-only task listings.
    value = {"source_url": url, "retrieved_at": stamp, "kind": props["kind"],
             "benchmark": props["benchmark"], "leaderboardData": props["leaderboardData"]}
    save("mercor-" + key + ".json", encode(value), url, stamp,
         "__NEXT_DATA__.props.pageProps: benchmark, kind, leaderboardData, all rows, no sample prompts",
         hashlib.sha256(body).hexdigest())

url = "https://parallel.ai/leaderboard"
body, stamp = fetch(url)
records = {}
metadata_dates = set()


def walk(value):
    if isinstance(value, dict):
        if "modelDisplay" in value and "searchCondition" in value:
            record_id = value["id"]
            if record_id in records and records[record_id] != value:
                raise ValueError("Conflicting Parallel record: " + record_id)
            records[record_id] = value
        if "asOf" in value:
            metadata_dates.add(value["asOf"])
        for child in value.values():
            walk(child)
    elif isinstance(value, list):
        for child in value:
            walk(child)


for match in re.finditer(r'self\.__next_f\.push\((\[.*?\])\)</script>', body.decode(), re.S):
    packet = json.loads(match.group(1))
    if len(packet) < 2 or not isinstance(packet[1], str):
        continue
    for line in packet[1].splitlines():
        if ":" not in line:
            continue
        payload = line.split(":", 1)[1]
        if payload.startswith(("[", "{")):
            try:
                walk(json.loads(payload))
            except json.JSONDecodeError:
                continue
if not records:
    raise ValueError("No Parallel records extracted")
save("parallel-search-capability.json", encode({
    "source_url": url, "retrieved_at": stamp,
    "source_as_of": sorted(metadata_dates), "records": list(records.values()),
}), url, stamp, "Decoded React Flight JSON: complete objects with modelDisplay and searchCondition, deduplicated by published id",
    hashlib.sha256(body).hexdigest())

base = "https://huggingface.co/spaces/muset-ai/DeepResearch-Bench-Leaderboard/resolve/main/"
for name, remote in [
    ("drb1-gemini25.csv", "data/leaderboard.csv"),
    ("drb1-gpt55.csv", "data_gpt55/leaderboard.csv"),
    ("drb2-gpt55.csv", "data_drb2/leaderboard.csv"),
    ("drb2-gemini25.csv", "data_drb2/leaderboard_gemini25.csv"),
]:
    url = base + remote
    body, stamp = fetch(url)
    save(name, body, url, stamp, "Original public leaderboard CSV, unchanged bytes",
         hashlib.sha256(body).hexdigest())

(OUT / "manifest.json").write_bytes(encode({"capture_version": "proposal-evidence-v1", "artifacts": manifest}))
print(json.dumps({"artifacts": len(manifest), "parallel_records": len(records), "source_as_of": sorted(metadata_dates)}))
