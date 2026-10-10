# Vibe Atlas

[![CI](https://github.com/WarLikeLaux/vibe-atlas/actions/workflows/pages.yml/badge.svg?branch=main)](https://github.com/WarLikeLaux/vibe-atlas/actions/workflows/pages.yml)

English | [Русский](README-ru.md)

Vibe Atlas collects coding agent and model benchmarks, vendor guidance, and recommendations from developers and vibe coders. Each published finding will include its source, verification date, and the exact agent, model, and evaluation settings.

Benchmarks and recommendations come first. Subscription information will describe available models, plans, and usage limits alongside the evidence. Task-based selection and integration with HAPI come later.

[Website](https://warlikelaux.github.io/vibe-atlas/) · [Product goals](PRODUCT.md) · [Roadmap](docs/roadmap.md) · [Data policy](docs/data-policy.md) · [Architecture](docs/architecture.md)

## Current status

The project has a React and TypeScript foundation, a searchable source registry, quality checks, and deployment to GitHub Pages. Benchmark imports, published findings, verified subscription details, and recommendations have not been implemented yet. The site labels registered sources as awaiting verification.

The interface and product documents currently use Russian. Both READMEs describe the same scope and development commands.

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

`check` runs type checking, data validation, linters, formatting checks, unused-code analysis, and a production build. `preview` serves the build from `dist/`. Husky runs `check` before each commit.

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

Future imports will retain source snapshots, exact identifiers, and evaluation conditions. Import credentials belong in GitHub Actions Secrets. See the [data policy](docs/data-policy.md) for provenance, freshness, and affiliate-link rules.
