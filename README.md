# PayloadLens

**Same event. Different story.** A privacy-conscious, browser-only webhook payload comparison workbench built by [Ahmad Yar](https://www.ahmadyar.co/).

Paste two synthetic JSON event payloads, inspect changed JSON paths and added/removed/modified fields, and export a **redacted** fixture for reproducible debugging. Processing occurs on your device; this project does not host a payload receiver, account system or API.

## Run

Node.js 20+:

    npm install
    npm run dev

Build for a static website (for example Vercel):

    npm run build

Run tests:

    npm test

## Features

- Visual before/after JSON inspection with deterministic path-level change summaries.
- Structured diff powered by [jsondiffpatch](https://github.com/benjamine/jsondiffpatch) (MIT), including array move recognition.
- Recursive masking for obvious credential-bearing keys and Bearer tokens **before generating the diff**.
- Export redacted baseline, revised payload, and change paths into a single JSON fixture.
- Example event pair for instant local testing.
- Responsive interface, no app backend, no login, no analytics.

## Security and limitations

**Do not paste production secrets.** Redaction is a best-effort convenience and is **not** complete PII scrubbing. Custom sensitive fields and unusual credential formats may not be recognized. Review every export before sharing.

Differences only in redacted credential values are intentionally hidden. Inputs are limited to 150 KB and deeply nested JSON is rejected. This app does not validate a sender's signature, run a webhook receiver, or establish delivery guarantees.

For learning retry and signature semantics, see the separate [Webhook Reliability Lab](https://github.com/ahamdjin/webhook-reliability-lab).

## Upstream credits

Uses [jsondiffpatch](https://github.com/benjamine/jsondiffpatch) as an MIT-licensed dependency; its source is not copied into this repository. The original product interface, safe-fixture workflow and tests are by Ahmad Yar (MIT).

**Status:** Functional browser MVP source, not yet deployed or publicly launched. Install and run the checks before announcing it.
