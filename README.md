# PayloadLens

**Catch webhook payload drift before it breaks consumers.** A local-first, open-source JSON webhook contract workbench by [Ahmad Yar](https://www.ahmadyar.co/).

**Live demo:** https://payloadlens.vercel.app/ · **Source:** https://github.com/ahamdjin/payloadlens

## What makes it useful

PayloadLens is **not** a hosted webhook receiver or delivery/replay infrastructure. It solves a different developer problem: take two real-world (preferably synthetic or sanitized) event samples, identify changes, and prepare a safe-ish fixture for regression tests.

- Compare two nested JSON payloads locally in your browser with [jsondiffpatch](https://github.com/benjamine/jsondiffpatch) (MIT).
- Inspect changed JSON paths with additions, removals, modifications, and array differences.
- **Contract-drift review:** identify removed paths and changed JSON value types as potential consumer breakages, and show additions and array-size changes separately.
- **Masking first:** configurable comma-separated field names plus a conservative default list (API keys, tokens, email, phone, card number, etc.). All report construction uses masked samples.
- **Export a redacted fixture** containing both examples, structural findings, and path-level changes.
- **Generate a draft JSON Schema** from the *redacted revised sample* for review and use in your own contract-testing workflows. It deliberately does not infer required keys or production semantics from a single sample.
- Responsive interface, no account, server, database, telemetry, or third-party analytics in application source.

## Try it locally

Requires Node.js 22 or later:

```sh
npm install
npm test
npm run build
npm run dev
```

The app is entirely static and can be hosted on Vercel or a static host.

## Crucial privacy limits

**Do not paste confidential production data or credentials.** Redaction is *best-effort*, not a comprehensive secret scanner, PCI protection, PII anonymizer, or a guarantee that exported files are safe. User-defined sensitive fields may remain in unrecognized keys or free-text values. Masked fields are not meaningfully compared; a type change within a masked field will not be reported. Review all downloaded artifacts before distributing them.

Type-change and removed-field warnings are **structural heuristics**, not proof that your webhook consumer is broken: optional and nullable fields, provider versions, payload variants, and union types affect true compatibility. The generated JSON Schema is an editable **starting point**, not a formally validated specification. A single example cannot establish required fields. No live webhook endpoints, signature validation, request capture, replay or delivery guarantee are offered.

For delivery retries, idempotency, and signatures, see [Webhook Reliability Lab](https://github.com/ahamdjin/webhook-reliability-lab).

## Upstream and license

Uses the maintained [jsondiffpatch](https://github.com/benjamine/jsondiffpatch) dependency under MIT. This application does not copy upstream code. Original product UI and drift/fixture analysis by Ahmad Yar; MIT-licensed source.

## Quality

`npm run build` requires unit tests to pass. Github Actions verifies new commits; browser smoke checks exercise the actual deployed app workflow before marketplace launch.
