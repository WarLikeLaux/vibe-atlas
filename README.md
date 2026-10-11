# Vibe Atlas

[![CI](https://github.com/WarLikeLaux/vibe-atlas/actions/workflows/pages.yml/badge.svg?branch=main)](https://github.com/WarLikeLaux/vibe-atlas/actions/workflows/pages.yml)

English | [Русский](README-ru.md)

Vibe Atlas collects coding agent and model benchmarks, vendor guidance, and recommendations from developers and vibe coders. Each published finding will include its source, verification date, and the exact agent, model, and evaluation settings.

Benchmarks and recommendations come first. Subscription information will describe available models, plans, and usage limits alongside the evidence. Task-based selection and integration with HAPI come later.

[Website](https://warlikelaux.github.io/vibe-atlas/) · [Product goals](PRODUCT.md) · [Roadmap](docs/roadmap.md) · [Data policy](docs/data-policy.md) · [Architecture](docs/architecture.md)

## Current status

The project has a React and TypeScript foundation, a searchable source registry, quality checks, and deployment to GitHub Pages. The first Artificial Analysis Coding Agents import contains 37 configurations and 111 component scores, checked on October 10, 2026. The site shows searchable results, run settings, benchmark passports, and explicit review status. The AA Models import adds 697 configurations, checked on the same date, with the complete source snapshot preserved. A [unified model table](docs/model-comparison.md) shows selected versions, configuration ranges, benchmark sorting, and medal counts. Ten rows are shown at a time. The editorial model set still needs a full vendor-source freshness audit. See the [model import](docs/aa-models-import.md). Remaining AA sections, verified model identity mapping, subscription details, and recommendations remain to be added. See the [import workflow](docs/artificial-analysis-import.md). The [Cursor import](docs/cursor-import.md) adds 68 CursorBench 4.0 configurations and 14 Composer-page scores, preserving versions, source precision, and vendor attribution.

The interface and product documents currently use Russian. Both READMEs describe the same scope and development commands.

The user's selected models form the core scope, with the latest versions of specific vendor lineages and variants added for comparison. See the [model scope](docs/model-scope.md) and [continuation context](docs/handoff.md), currently in Russian, for the agreed distinctions between models, versions, agents, and effort settings.

The [official Terminal-Bench 4.0 import](docs/terminal-bench-import.md) adds 35 runs across five agent protocols. New benchmarks use a shared data pack without hand-editing the table. Every build produces a standalone `dist/vibe-atlas.html`; refresh commands and current limits are documented in the [automation guide](docs/benchmark-automation.md).

## Priorities

1. Build a broad registry of relevant coding benchmarks and import results, starting with [Artificial Analysis Coding Agents](https://artificialanalysis.ai/agents/coding-agents). Preserve each benchmark's methodology and exact run configuration.
2. Collect vendor guidance, independent evaluations, and recommendations from developers and vibe coders. Keep authorship, dates, task context, and commercial disclosures.
3. Add reference information about subscription plans, available models, compatibility, prices, and limits in their original units.
4. Use this evidence for task-based recommendations and a future versioned export for HAPI.

## Development

Requires Node.js 22.12 or newer. CI uses Node.js 22.

```sh
npm ci
npm run dev
```

Vite prints the local URL with the `/vibe-atlas/` prefix.

```sh
npm run check
npm run preview
```

`check` runs type checking, data validation, import regression checks, linters, formatting checks, unused-code analysis, and a production build. `preview` serves the build from `dist/`. Husky runs `check` before each commit.

## Quality checks

| Command                    | Checks                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`        | Strict TypeScript, checked indexed access, exact optional properties, unused variables                                          |
| `npm run validate:data`    | Source registry validation with Zod                                                                                             |
| `npm run lint:code`        | ESLint, type-aware strict typescript-eslint, React Hooks, React Refresh, JSX accessibility, imports, Security, SonarJS, Unicorn |
| `npm run lint:styles`      | Stylelint standard                                                                                                              |
| `npm run lint:docs`        | markdownlint-cli2                                                                                                               |
| `npm run format:check`     | Prettier                                                                                                                        |
| `npm run check:unused`     | Knip                                                                                                                            |
| `npm run build`            | TypeScript checking and a Vite production build                                                                                 |
| `npm run audit:production` | Vulnerability audit of runtime dependencies                                                                                     |

Run `npm run format` to format files. ESLint allows zero warnings. To fix CSS findings, run `npx stylelint 'src/**/*.css' --fix`.

`npm run audit:production` also runs in CI and checks the dependencies shipped with the site.

ESLint 9 and Unicorn 62 form a compatible toolchain with `eslint-plugin-jsx-a11y`, whose declared support currently stops at ESLint 9. TypeScript must stay within the peer range supported by typescript-eslint, and Node types must match the Node 22 runtime. Upgrade constrained majors together without `--force` or `--legacy-peer-deps`.

As of October 10, 2026, the full `npm audit` reports eight related high-severity findings in development tools through `braces@3.0.3` ([advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)). No patched braces release is available in npm on that date. Project glob patterns are explicitly defined, and braces is not a runtime dependency. Overrides for smol-toml and katex address separate patched advisories. Dependabot tracks updates.

## Deployment

The public repository uses free GitHub Pages hosting. Settings → Pages must use GitHub Actions as its source. `.github/workflows/pages.yml` checks pull requests and publishes checked builds from `main`. Deployment permissions are restricted to the deployment job.

Vite's base path is `/vibe-atlas/`. Section links use anchors and do not need a server-side SPA fallback. Official guides: [Vite](https://vite.dev/guide/static-deploy.html#github-pages), [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

## Sources and contributions

`data/sources.json` registers selected sources. A new entry has `status: registered` and `lastCheckedAt: null`. Registration dates do not verify benchmark results, recommendations, or subscription terms.

To suggest a benchmark, recommendation, or correction, [open an issue](https://github.com/WarLikeLaux/vibe-atlas/issues/new) with the original URL, author or publisher, publication date when available, and the relevant agent, model, or task. Do not invent missing scores, quotas, or testimonials.

The first import retains source snapshots, source identifiers, and evaluation conditions. Import credentials belong in GitHub Actions Secrets. See the [data policy](docs/data-policy.md) for provenance, freshness, and affiliate-link rules.
