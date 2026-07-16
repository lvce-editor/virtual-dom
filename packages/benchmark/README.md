# Virtual DOM benchmark

This package runs Krausest-style table operations in Chromium with Playwright.
The timed region starts immediately before the virtual DOM diff and ends after
the browser has applied the resulting DOM and layout changes.

From the repository root:

```sh
npm run benchmark
```

The command writes a static report to `packages/benchmark/dist`. The number of
warmup and measured samples can be adjusted with
`BENCHMARK_WARMUP_ITERATIONS` and `BENCHMARK_ITERATIONS`.
