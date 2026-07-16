# Virtual DOM benchmark

This package runs Krausest-style table operations in Chromium with Playwright.
The timed region starts immediately before the virtual DOM diff and ends after
the browser has applied the resulting DOM and layout changes.

From the repository root:

```sh
npm run benchmark
```

The command writes a static report to `packages/benchmark/dist`. By default it
runs five fresh browser processes and reports the median of each operation's
per-run medians. The number of independent runs, warmup samples, and measured
samples can be adjusted with `BENCHMARK_REPEATS`,
`BENCHMARK_WARMUP_ITERATIONS`, and `BENCHMARK_ITERATIONS`.

Alongside the Krausest-style table operations, focused cases measure
`setProps` on 10,000 pre-created elements and native creation of 10,000
detached DOM elements.

## Real-world benchmarks

The Explorer benchmark downloads the explorer-view e2e tests, starts
`@lvce-editor/server`, loads `/tests/_all.html` once using Explorer's
`--reuse-page` mode, applies Explorer's per-test workspace and sidebar reset,
and records browser-wide V8 CPU samples for the page and its workers. The
workload is pinned to the explorer-view `v7.9.0` release and verified against
commit `ff1124ff6d67c79c6838b5aa7cd0bceee4a96976`:

```sh
npm run benchmark:detailed
```

The report is written to `packages/benchmark/dist/detailed-benchmark`. It
includes downloadable Chrome CPU profiles for each execution context, the
slowest e2e tests, and virtual-DOM-related CPU hotspots with unrelated
functions filtered out.

Native browser functions such as `document.createElement` are not virtual DOM
JavaScript frames, so they do not appear as standalone filtered hotspots.
Their sampled cost is included in the inclusive time of a virtual DOM caller
when that caller is present on the stack.

The activity bar benchmark uses the same profiling process with the
activity-bar-worker e2e suite. The workload is pinned to
activity-bar-worker `v7.10.0` at commit
`8c8c7a8275e85e8a15fcd15130df49fae07659ea`:

```sh
npm run benchmark:activity-bar
```

Its report is written to
`packages/benchmark/dist/activity-bar-benchmark`, which is published as a
separate GitHub Pages route. Three account context-menu tests are retained in
the profile and reported as allowed failures because the generic benchmark
server does not provide their signed-in account states. Any other test failure
still fails the benchmark job.

By default each real-world workload runs in five fresh browser profiles. Each
report shows the run with the median normalized virtual DOM CPU share and
includes the distribution across all runs.

For local development, `EXPLORER_VIEW_PATH` and `ACTIVITY_BAR_WORKER_PATH` can
point at existing checkouts. `EXPLORER_VIEW_REF` and
`ACTIVITY_BAR_WORKER_REF` can select different git refs, and
`DETAILED_BENCHMARK_FILTER` can select a smaller test subset.
`DETAILED_BENCHMARK_TIMEOUT_MS` controls the full-suite timeout,
`DETAILED_BENCHMARK_SAMPLING_INTERVAL_US` controls the V8 sampling interval,
and `DETAILED_BENCHMARK_REPEATS` controls the number of fresh browser runs.
