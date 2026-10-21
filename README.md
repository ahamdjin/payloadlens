# PayloadLens

A planned privacy-conscious developer workbench for inspecting and comparing webhook request samples. Project by [Ahmad Yar](https://www.ahmadyar.co/).

**Status:** Initial project setup; the app is not yet built or launched.

## Proposed MVP

- Paste or import synthetic JSON webhook payloads and headers.
- Compare two payloads with changed JSON paths highlighted.
- Inspect event structure and redact sensitive values before exports.
- Export safe fixtures and generate reproducible sample requests.
- Run comparisons locally in the browser where practical.

## Distinction from Webhook Reliability Lab

[Webhook Reliability Lab](https://github.com/ahamdjin/webhook-reliability-lab) teaches retries, signatures, idempotency, and delivery behavior. PayloadLens will focus on developer inspection, comparisons, and safe fixture generation, not simulate delivery guarantees.

## Open-source foundation

We will evaluate maintained JSON diff libraries with license and security review before integrating them. No third-party code has been copied into this repository.
