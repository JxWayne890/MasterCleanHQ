# MCC guides and Texas referral network

The website remains Vite and React. The new resource pages are generated as standalone HTML after the existing site build. They reuse the site's navy and orange palette, DM Serif Display headings, DM Sans text, logo, phone and business mailing address. Article pages require no client JavaScript. City and application pages load only a small form enhancement. Native form submission also works without JavaScript.

## Add a guide

Add one Markdown file to `content/guides`. Its filename becomes the URL slug. Required frontmatter:

```yaml
---
title: "A useful cleaning question"
description: "A specific summary of the answer and who it helps."
date: '2026-10-21'
category: "Planning and pricing"
related:
  - office-cleaning-checklist-small-businesses
  - what-to-look-for-janitorial-contract
---
```

Use `##` headings for the contents list and `###` for subsections. The template adds the visible date, author, canonical URL, description, Open Graph and Twitter tags, Article and breadcrumb schemas, contents links and related cards. Guides with at least 800 words receive a contents list. Keep each guide between 900 and 1500 words. End the Markdown with:

```markdown
[Get a free quote from Master Commercial Clean](/contact).
```

HTML comments are excluded from public output, allowing private editorial TODO notes. Raw HTML is escaped, and unsafe Markdown links are rejected by the renderer. The build rejects missing metadata and broken related guide references. The source date, or optional `updated` date, supplies the article sitemap date.

The guide index and sitemap discover new files automatically. Existing cost guide URLs remain intact. Guides should answer real facility management questions and distinguish a suggested schedule from a legal or universal requirement. Prices require verified MCC scope and figures. Do not invent reviews, customers, credentials or numerical results. Miles ISD is a confirmed MCC customer, but no endorsement or expanded account history is implied.

## Weekly workflow

A thread heartbeat named “Weekly MCC cleaning guide” runs Wednesdays at 9 AM in John's local America/Chicago timezone. It selects an unfinished topic from `GUIDES_BACKLOG.md`, prepares one guide, checks the build and creates a preview for review. It never publishes to production without John's explicit approval. Local scheduling requires the desktop environment and repository to be available. It does not add a Vercel cron, AI call or runtime workload to the website.

Mark a backlog topic complete once its article exists. Check existing guides first to avoid publishing another article for the same search intent. Keep primary sources close to any specialized factual claim and keep most content grounded in practical, original facility planning guidance.

## Add a city

Add one JSON file to `content/cities`. Start from an existing city file. Required fields are `name`, `description`, `intro`, `partnerStatus`, `suburbs`, `buildingTypes`, `sections` and `source`. Each section has a heading and paragraphs. The filename becomes `/partner-network/filename`.

The build automatically adds the city page, network card and sitemap entry. The form server reads the same city file to identify the region. No route or form code change is required. Keep real partner information in `partnerName` and `partnerVettingNotes` only after John confirms it. These private editorial placeholders are not rendered as fabricated public partner profiles.

Write distinct content about the actual locations, access, property types, operating windows and quote planning needs. The source entry supports geographic context. It does not imply a commercial relationship with the cited organization. City pages identify MCC as the referral provider and use Service schema with an area served. They do not claim a physical MCC address in Houston or Dallas Fort Worth.

This referral program targets established commercial businesses with at least $1 million in annual revenue. Its content and form exclude school and government contract targeting. Those restrictions apply to the referral program; the direct MCC guides can serve school facility managers. Partner availability is currently unconfirmed in both starting cities. The published status must remain honest until John supplies the actual partner details.

City pages display: “Master Commercial Clean may receive a referral fee from partner companies.” The local partner confirms its scope, coverage, quote and service agreement. John reviews applications before any company becomes a partner.

## Leads and internal alerts

The new form route is `/api/network-intake`. Records are structured JSON in MCC's private Supabase Storage bucket, separated into preview and production prefixes. See [network intake operations](NETWORK_INTAKE.md) for server configuration, spam protection, export and notification recovery.

Referral email subjects are `Referral Lead: [City] [Company]`. Partner application subjects are `Partner Application: [City] [Company]`. Both go exclusively to `john@mastercleanhq.com`. A stored record survives notification failure. Production server configuration and a verified sender are release requirements, not assumptions made from a successful local build.

The existing `/contact` form keeps its current CRM intake and gains an internal notification after a new confirmed CRM save. Existing duplicate handling and Form Guard observation remain intact. No automatic email is sent to a prospective customer.

## Verification and release

```bash
npm ci
npm run build
npm run lint
node --test test/*.test.*
```

`npm run build` generates the existing site first, then the new static pages. The content tests inspect the final HTML, Article metadata, contents links, qualification controls, schema, disclosure and sitemap coverage. Server tests verify storage before email, validation, origin controls, durable rate reservations and recovery.

For local static inspection, `npm run preview -- --host 127.0.0.1 --port 4173` serves directory indexes at paths ending with `/`. Vercel preview routing must be checked separately at the public canonical path without the trailing slash. All React links into the static resource pages use document navigation so that an old React route cannot replace the new HTML.

Only preview deployment is authorized for this request. Verify both new forms, private storage, the internal emails, mobile and desktop layouts, existing quote intake and sitemap before asking John to approve production. Do not remove projects, change billing, change accounts or alter DNS as part of publishing this feature.
