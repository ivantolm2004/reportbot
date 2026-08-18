# Architecture

```text
CSV file → parseCsv() → normalized rows → analyzeSales() → dashboard
```

The project uses a functional-core / imperative-shell design. `src/analytics.js` contains pure functions without browser dependencies, so the same engine works in the UI, a Node.js worker or a scheduled backend job.

Required CSV columns: `date`, `amount`. Optional: `order_id`, `returned`. Comma and semicolon delimiters, quoted cells, decimal commas and UTF-8 BOM are supported.
