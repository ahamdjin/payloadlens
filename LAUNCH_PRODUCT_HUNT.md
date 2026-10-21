# PayloadLens — Product Hunt launch materials

**Submission is NOT completed.** Use these only after the latest changes are publicly deployed and smoke-tested at https://payloadlens.vercel.app/.

**Product name:** PayloadLens

**Tagline (under 60 characters):** Catch webhook payload drift before it breaks your code

**Short description:**
Compare two webhook JSON events locally, catch removed fields and type changes, mask sensitive keys, and export redacted test fixtures or a draft JSON Schema. Free, open-source, and browser-based; no webhook receiver or account needed.

**Product URL:** https://payloadlens.vercel.app/

**GitHub:** https://github.com/ahamdjin/payloadlens

**Pricing:** Free / Open source

**Topics:** Developer Tools, APIs, Open Source (select the closest categories the form actually offers).

**Maker:** Ahmad Yar

## Story / first maker comment (edit to your voice)

Hi Product Hunt! I'm Ahmad Yar. When a webhook provider updates an event, the change isn't always obvious until an integration breaks. I built PayloadLens to compare two JSON event samples and make removed fields or changed types easy to spot. You can mask common sensitive keys, add your own field names, export a redacted fixture, or generate a draft JSON Schema for further testing.

The app works in your browser without an account, tracking or a hosted webhook inbox. Redaction is best-effort, so please use synthetic or already sanitized data and review every export before sharing. I'd love feedback from developers working with webhooks: which drift warning would save you the most debugging time?

## Launch assets

The **Browser tests** GitHub Actions workflow runs `e2e/gallery.spec.js`. Download its `payloadlens-launch-gallery` artifact to get:
- `payloadlens-overview.png`: 1270×760 actual interface view
- `payloadlens-drift-review.png`: 1270×760 structural drift screen
- `payloadlens-thumbnail.png`: 240×240 product icon rendered from `public/logo.svg`

Validate the screenshots and product page before posting. Product Hunt's own guide asks for a square thumbnail and at least two gallery images. Do not submit screenshots if they do not reflect the production build.

## Important limitations to disclose

PayloadLens does not capture HTTP requests, replay webhooks, verify signatures or host event inboxes. Schema inference from one example is not strict compatibility validation. Best-effort masking does not guarantee comprehensive secret/PII removal.
