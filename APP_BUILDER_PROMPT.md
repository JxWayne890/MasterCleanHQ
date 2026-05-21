# Builder Prompt — Master Commercial Clean (v2)

> Paste this entire file into your builder tool (Lovable, Bolt, v0, Replit Agent, Cursor, etc.) as a single prompt.

---

## What to build

A very simple web app for **Master Commercial Clean** that does three things:

1. **Worker check-in** — a public page where the two workers tap a button to log that they cleaned the location today.
2. **Owner dashboard** — a private page (John's) that shows this month's visits, the running total, and a one-click "Generate Invoice" button.
3. **Invoice history** — a list of every invoice ever generated, with status (Draft / Sent / Paid), a link to view/print the HTML invoice, and a "Mark as sent" toggle.

Keep it dead simple. No fancy auth for v1. One Veribest route, two workers, one client. The route now covers both the Field House and the Agriculture Classroom on the same service days.

---

## Tech stack

- **Frontend:** React + Vite + Tailwind (or Next.js if the builder prefers it).
- **Backend / DB:** Supabase (Postgres + Row Level Security). Workers check in from their phones, so it needs to be cloud-based, not local storage.
- **PDF / Print:** Render invoices as HTML using the template below. Use the browser's native print-to-PDF for now (window.print with `@page` rules already set in the CSS).
- **Hosting:** Vercel or Netlify is fine.

---

## Seed data (hard-code on first run)

### Company (the business sending invoices)
- **Name:** John W. Johnson
- **Company:** Master Commercial Clean
- **Phone:** 325-273-2203
- **Email:** john@mastercleanhq.com
- **Website:** mastercleanhq.com

### Locations / route
- **Business:** Veribest Independent School District
- **Facilities:** Field House + Agriculture Classroom
- **Address / City:** Veribest, Texas
- **Client code:** `VBHS`
- **Contact:** Mandy Traylor
- **Service schedule:** Every Tuesday and Thursday
- **Field House rate:** $125.00 per visit (recurring cleanup)
- **Agriculture Classroom rate:** $125.00 per visit (recurring cleanup)
- **Combined route rate:** $250.00 per logged visit because the two facilities are cleaned on the same days.

### Workers (only two for v1)
- Melissa Castillo
- James Reynolds

---

## Data model

```sql
-- locations
id uuid pk
name text                -- "Veribest High School" or "Veribest Independent School District"
facility text            -- "Field House" or "Agriculture Classroom"
client_code text         -- "VBHS"
contact_name text        -- "Mandy Traylor"
city_state text          -- "Veribest, Texas"
rate_per_visit numeric   -- 125.00
schedule text            -- "Tue & Thu"
created_at timestamptz

-- workers
id uuid pk
name text                -- "Melissa Castillo"
active boolean default true
created_at timestamptz

-- visits (the check-ins)
id uuid pk
location_id uuid fk -> locations.id
worker_id uuid fk -> workers.id
visit_date date          -- the day they cleaned (default today in America/Chicago)
note text nullable       -- optional free-text note
created_at timestamptz

-- invoices
id uuid pk
invoice_number text unique      -- e.g. "VBHS-INV-002"
location_id uuid fk -> locations.id
period_start date               -- first visit date in the invoice
period_end date                 -- last visit date in the invoice
subtotal numeric                -- sum of visits * rate
tax numeric default 0
total numeric                   -- subtotal + tax
status text                     -- 'draft' | 'sent' | 'paid'
issue_date date
due_date date                   -- issue_date + 15 days (Net 15)
service_label text              -- "Recurring Cleanup Service" OR custom (e.g. "One-Time Deep Clean")
html_snapshot text              -- the rendered HTML of the invoice (frozen at send-time)
pdf_url text nullable           -- optional, if you store a rendered PDF
created_at timestamptz

-- invoice_line_items (one per visit, so the invoice lists each date)
id uuid pk
invoice_id uuid fk -> invoices.id
description text          -- "Cleanup visit — Tuesday, May 5, 2026"
visit_date date nullable  -- null for custom line items like a deep clean
qty integer               -- normally 1
rate numeric              -- 125.00 per single facility, 250.00 for the combined Veribest route
amount numeric            -- qty * rate
```

---

## Screens & flows

### 1. Worker Check-In page — `/checkin`
- Public, no login.
- Big heading: **"Veribest Field House + AG Classroom — Cleanup Check-In"**
- Today's date at top.
- Two giant buttons, full-width on mobile:
  - **"Melissa — I cleaned today ✓"**
  - **"James — I cleaned today ✓"**
- Tapping a button:
  - Inserts a `visits` row for that worker, today's date, and the combined Veribest route.
  - The amount for the logged visit is `$250.00` (`$125.00` Field House + `$125.00` Agriculture Classroom).
  - Shows a green confirmation banner: *"Thanks Melissa — logged for Tue, May 5, 2026."*
  - Disables that worker's button for the rest of the day (check existing visits for today before allowing a duplicate).
- Below the buttons, show a small "Today's check-ins" list so they can see their own log.

### 2. Owner Dashboard — `/` (home, simple PIN gate — PIN `0000` hard-coded for now, we'll replace later)
- Top card: **This Month at Veribest**
  - Visit count (e.g. "8 visits")
  - Running total ("8 × $250 = **$2,000.00**")
  - Button: **"Generate Invoice for Mandy"** → creates an invoice in `draft` state covering all un-invoiced visits in the current month, then redirects to the invoice detail page.
- Calendar-style list below: every visit this month with worker name + date, most recent first.
- Link at top: "View all invoices →" goes to `/invoices`.

### 3. Invoice list — `/invoices`
- Table with columns: **Invoice #**, **Date**, **Period**, **Facility**, **Amount**, **Status**, **Actions**.
- Status badge colors: Draft = gray, Sent = blue, Paid = green.
- Actions per row: **View** (opens `/invoices/:id`), **Mark as Sent**, **Mark as Paid**, **Delete** (only if draft).
- Pre-seed this table with the historical invoice below (status = **Paid** since it's a past record).

### 4. Invoice detail — `/invoices/:id`
- Renders the HTML invoice template (below) populated from DB fields.
- Top toolbar (not printed): **Print / Save PDF**, **Mark as Sent**, **Mark as Paid**, **Back to list**.
- `window.print()` uses the `@page` rules in the template so it comes out clean Letter-size.

---

## Invoice numbering rule

- Format: `{CLIENT-CODE}-INV-{###}` — zero-padded 3 digits.
- Per-client sequence. Veribest = `VBHS`.
- To compute the next number: `SELECT max(invoice_number) WHERE invoice_number LIKE 'VBHS-INV-%'`, parse the tail, add 1, pad to 3.
- **Next Veribest invoice = `VBHS-INV-004`** after the seeded Field House recurring invoice and Agriculture Classroom deep-clean invoice.

---

## Pre-loaded "saved" invoices

Insert this as a `paid` invoice on first run so the history isn't empty:

```json
{
  "invoice_number": "VBHS-INV-001",
  "location": "Veribest High School — Field House",
  "client_code": "VBHS",
  "contact": "Mandy Traylor",
  "service_label": "One-Time Deep Clean",
  "issue_date": "2026-04-22",
  "due_date": "2026-05-07",
  "period_start": "2026-04-01",
  "period_end": "2026-04-22",
  "subtotal": 500.00,
  "tax": 0.00,
  "total": 500.00,
  "status": "paid",
  "line_items": [
    {
      "description": "Deep Clean — Veribest High School Field House. Heavy-duty deep cleaning beyond standard maintenance scope: full floor service, trash & liners, locker exteriors, weight room, offices, and full restroom sanitization.",
      "visit_date": null,
      "qty": 1,
      "rate": 500.00,
      "amount": 500.00
    }
  ]
}
```

When an owner views `VBHS-INV-001` or `VBHS-INV-003`, it should render using the same HTML template below (the "deep clean" variant — use the scope-of-work sections shown in the template). For **recurring** invoices (`VBHS-INV-002` and `VBHS-INV-004` onward) the scope-of-work sections are replaced by a line-item list of visit dates.

Also insert this Agriculture Classroom deep-clean invoice as a `draft` invoice so it appears in invoice history without being sent:

```json
{
  "invoice_number": "VBHS-INV-003",
  "location": "Veribest Independent School District — Agriculture Classroom",
  "client_code": "VBHS",
  "contact": "Mandy Traylor",
  "service_label": "One-Time Deep Clean",
  "issue_date": "2026-05-12",
  "due_date": "2026-06-15",
  "period_start": "2026-05-11",
  "period_end": "2026-05-11",
  "subtotal": 400.00,
  "tax": 0.00,
  "total": 400.00,
  "status": "draft",
  "line_items": [
    {
      "description": "Deep Clean — Agriculture Classroom. Heavy-duty deep cleaning beyond standard maintenance scope: full floor service, trash and liners, high-touch surfaces, offices/common areas, and restroom sanitization.",
      "visit_date": null,
      "qty": 1,
      "rate": 400.00,
      "amount": 400.00
    }
  ]
}
```

---

## Recurring-invoice rendering rules

When an invoice's `service_label` is **"Recurring Cleanup Service"**:

- **Charges table** lists one row per visit:
  - Description: `Cleanup Visit — Field House + Agriculture Classroom — {Weekday}, {Month Day, Year}` (e.g. "Cleanup Visit — Field House + Agriculture Classroom — Tuesday, May 5, 2026")
  - QTY: `1`
  - RATE: `$250.00`
  - AMOUNT: `$250.00`
- **Service overview** block shows:
  - Service: `Recurring Cleanup Service`
  - Facility: `High School Field House + Agriculture Classroom`
  - Schedule: `Tuesdays & Thursdays`
  - Period: `{period_start formatted} – {period_end formatted}`
- **Scope of work sections** (General Areas / Locker Rooms / Restrooms / Offices) are **hidden** for recurring invoices. Those sections only appear for `One-Time Deep Clean` invoices.

When `service_label` is **"One-Time Deep Clean"**:
- Render the scope-of-work sections exactly as in the template below.
- Charges table has a single line matching the line item.

---

## FULL HTML INVOICE TEMPLATE

Use this exact HTML/CSS for every invoice. Replace `{{...}}` placeholders with real data. Keep the styling byte-for-byte — this is the approved brand look.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice {{invoice_number}} — {{location_full_name}}</title>
<style>
  @page { size: Letter; margin: 0.5in; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #1f2937;
    font-size: 12px;
    line-height: 1.45;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page { padding: 32px 36px 24px 36px; }

  /* Header */
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding-bottom: 14px;
    border-bottom: 4px solid #11366b;
    position: relative;
  }
  .header::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: -4px;
    width: 110px;
    height: 4px;
    background: #f08a1c;
  }
  .header .logo img { width: 175px; height: auto; display: block; }
  .header .title { text-align: right; }
  .header .title h1 {
    font-size: 32px;
    color: #11366b;
    margin: 0;
    letter-spacing: 1px;
    font-weight: 800;
  }
  .header .title .meta {
    color: #6b7280;
    font-size: 12px;
    margin-top: 6px;
    letter-spacing: 0.5px;
  }

  /* Two-column info */
  .info-row { display: flex; gap: 36px; margin-top: 22px; }
  .info-col { flex: 1; }
  .info-label {
    color: #11366b;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    border-bottom: 2px solid #11366b;
    padding-bottom: 5px;
    margin-bottom: 10px;
  }
  .info-line { display: flex; padding: 4px 0; }
  .info-line .k { width: 90px; color: #6b7280; font-weight: 600; }
  .info-line .v { color: #1f2937; font-weight: 600; }
  .info-line .v.bold { font-weight: 800; color: #11366b; }

  /* Section heading bar */
  .section-bar {
    background: #11366b;
    color: #ffffff;
    font-weight: 800;
    letter-spacing: 1.5px;
    font-size: 12px;
    padding: 10px 14px;
    margin-top: 22px;
  }

  /* Scope groups (deep-clean invoices only) */
  .group-head {
    background: #e8eef7;
    color: #11366b;
    font-weight: 800;
    font-size: 11px;
    letter-spacing: 1.5px;
    padding: 8px 14px;
    border-bottom: 1px solid #d4dcec;
  }
  .scope-table { border: 1px solid #e3e7ee; border-top: none; }
  .scope-row {
    padding: 8px 14px;
    border-bottom: 1px solid #eef1f6;
    display: flex;
    align-items: flex-start;
  }
  .scope-row:last-child { border-bottom: none; }
  .scope-row .bullet { color: #f08a1c; margin-right: 10px; font-size: 14px; line-height: 1.1; }

  /* Charges table */
  .charges {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0;
    border: 1px solid #e3e7ee;
    border-top: none;
  }
  .charges thead th {
    background: #f6f8fb;
    color: #11366b;
    text-align: left;
    font-size: 11px;
    letter-spacing: 1px;
    padding: 9px 14px;
    border-bottom: 1px solid #d4dcec;
  }
  .charges thead th.right { text-align: right; }
  .charges td {
    padding: 11px 14px;
    border-bottom: 1px solid #eef1f6;
    vertical-align: top;
  }
  .charges td.right { text-align: right; }
  .charges .desc-title { font-weight: 700; color: #11366b; margin-bottom: 2px; }
  .charges .desc-sub { color: #6b7280; font-size: 11px; }

  /* Totals */
  .totals { margin-top: 14px; display: flex; justify-content: flex-end; }
  .totals-box { width: 280px; border: 1px solid #e3e7ee; }
  .totals-row {
    display: flex;
    justify-content: space-between;
    padding: 9px 14px;
    border-bottom: 1px solid #eef1f6;
    font-size: 12px;
  }
  .totals-row.total {
    background: #f08a1c;
    color: #ffffff;
    font-size: 16px;
    font-weight: 800;
    border-bottom: none;
    letter-spacing: 0.5px;
  }
  .totals-row .label { color: #6b7280; font-weight: 600; }
  .totals-row.total .label { color: #ffffff; }
  .totals-row .val { color: #11366b; font-weight: 700; }
  .totals-row.total .val { color: #ffffff; }

  /* Payment block */
  .pay-row { display: flex; gap: 16px; margin-top: 22px; }
  .pay-card { flex: 1; border: 1px solid #e3e7ee; padding: 14px 16px; }
  .pay-card h3 { margin: 0 0 8px 0; color: #11366b; font-size: 12px; letter-spacing: 1.5px; }
  .pay-card p { margin: 3px 0; color: #374151; }
  .pay-card .due { color: #f08a1c; font-weight: 800; }

  /* Terms */
  .terms {
    margin-top: 18px;
    background: #f6f8fb;
    padding: 14px 18px;
    border-left: 3px solid #11366b;
  }
  .terms h4 { margin: 0 0 6px 0; color: #11366b; font-size: 11px; letter-spacing: 1.5px; }
  .terms ul { margin: 0; padding-left: 18px; color: #374151; }
  .terms li { padding: 1px 0; }

  /* Footer */
  .footer {
    margin-top: 22px;
    background: #11366b;
    color: #ffffff;
    text-align: center;
    padding: 14px 16px;
    font-size: 11px;
  }
  .footer .thanks { font-style: italic; margin-bottom: 4px; }
  .footer .contact { color: #f08a1c; font-weight: 700; letter-spacing: 0.4px; }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="logo">
      <img src="{{logo_url}}" alt="Master Commercial Clean" />
    </div>
    <div class="title">
      <h1>INVOICE</h1>
      <div class="meta">Invoice # {{invoice_number}} &nbsp;•&nbsp; {{issue_date_long}}</div>
    </div>
  </div>

  <!-- FROM / BILL TO -->
  <div class="info-row">
    <div class="info-col">
      <div class="info-label">FROM</div>
      <div class="info-line"><span class="k">Name</span><span class="v bold">John W. Johnson</span></div>
      <div class="info-line"><span class="k">Company</span><span class="v">Master Commercial Clean</span></div>
      <div class="info-line"><span class="k">Phone</span><span class="v">325-273-2203</span></div>
      <div class="info-line"><span class="k">Email</span><span class="v">john@mastercleanhq.com</span></div>
    </div>
    <div class="info-col">
      <div class="info-label">BILL TO</div>
      <div class="info-line"><span class="k">Business</span><span class="v bold">{{business_name}}</span></div>
      <div class="info-line"><span class="k">Facility</span><span class="v">{{facility}}</span></div>
      <div class="info-line"><span class="k">Contact</span><span class="v">{{contact_name}}</span></div>
      <div class="info-line"><span class="k">Location</span><span class="v">{{city_state}}</span></div>
    </div>
  </div>

  <!-- SERVICE OVERVIEW + PAYMENT -->
  <div class="info-row" style="margin-top: 18px;">
    <div class="info-col">
      <div class="info-label">SERVICE OVERVIEW</div>
      <div class="info-line"><span class="k">Service</span><span class="v">{{service_label}}</span></div>
      <div class="info-line"><span class="k">Facility</span><span class="v">{{facility_long}}</span></div>
      <!-- For recurring: show Schedule + Period. For deep clean: show Approx. Size + Date Performed. -->
      {{#if recurring}}
      <div class="info-line"><span class="k">Schedule</span><span class="v">Tuesdays &amp; Thursdays</span></div>
      <div class="info-line"><span class="k">Period</span><span class="v">{{period_range}}</span></div>
      {{else}}
      <div class="info-line"><span class="k">Approx. Size</span><span class="v">~4,500 Sq Ft</span></div>
      <div class="info-line"><span class="k">Date Performed</span><span class="v">{{date_performed}}</span></div>
      {{/if}}
    </div>
    <div class="info-col">
      <div class="info-label">PAYMENT</div>
      <div class="info-line"><span class="k">Invoice Date</span><span class="v">{{issue_date_long}}</span></div>
      <div class="info-line"><span class="k">Terms</span><span class="v">Net 15</span></div>
      <div class="info-line"><span class="k">Due Date</span><span class="v bold">{{due_date_long}}</span></div>
      <div class="info-line"><span class="k">Amount Due</span><span class="v bold">${{total}}</span></div>
    </div>
  </div>

  <!-- DEEP-CLEAN ONLY: Scope of work -->
  {{#if deep_clean}}
  <div class="section-bar">SCOPE OF WORK COMPLETED</div>

  <div class="group-head">GENERAL AREAS</div>
  <div class="scope-table">
    <div class="scope-row"><span class="bullet">•</span><span>Swept and mopped all floors throughout the field house</span></div>
    <div class="scope-row"><span class="bullet">•</span><span>Trash removal and liner replacement in all bins</span></div>
    <div class="scope-row"><span class="bullet">•</span><span>Deep cleaning and dusting of surfaces, including countertops</span></div>
    <div class="scope-row"><span class="bullet">•</span><span>Detailed wipe-down of high-touch areas (door handles, light switches, rails)</span></div>
  </div>

  <div class="group-head" style="margin-top: 0;">LOCKER ROOMS &amp; WEIGHT ROOM</div>
  <div class="scope-table">
    <div class="scope-row"><span class="bullet">•</span><span>Deep cleaning of locker exteriors and surrounding surfaces</span></div>
    <div class="scope-row"><span class="bullet">•</span><span>Detailed cleaning of weight room equipment surfaces and floors</span></div>
    <div class="scope-row"><span class="bullet">•</span><span>Disinfecting of high-contact athletic surfaces</span></div>
  </div>

  <div class="group-head" style="margin-top: 0;">RESTROOMS</div>
  <div class="scope-table">
    <div class="scope-row"><span class="bullet">•</span><span>Deep cleaned and sanitized all toilets and urinals</span></div>
    <div class="scope-row"><span class="bullet">•</span><span>Cleaned sinks, mirrors, and countertops</span></div>
    <div class="scope-row"><span class="bullet">•</span><span>Mopped and disinfected restroom floors</span></div>
  </div>

  <div class="group-head" style="margin-top: 0;">OFFICES / COMMON AREAS</div>
  <div class="scope-table">
    <div class="scope-row"><span class="bullet">•</span><span>Deep cleaning of office surfaces and common areas</span></div>
    <div class="scope-row"><span class="bullet">•</span><span>Trash removal and detailed dusting throughout</span></div>
  </div>
  {{/if}}

  <!-- CHARGES -->
  <div class="section-bar">CHARGES</div>
  <table class="charges">
    <thead>
      <tr>
        <th style="width: 60%;">DESCRIPTION</th>
        <th class="right" style="width: 12%;">QTY</th>
        <th class="right" style="width: 14%;">RATE</th>
        <th class="right" style="width: 14%;">AMOUNT</th>
      </tr>
    </thead>
    <tbody>
      {{#each line_items}}
      <tr>
        <td>
          <div class="desc-title">{{this.title}}</div>
          {{#if this.subtitle}}<div class="desc-sub">{{this.subtitle}}</div>{{/if}}
        </td>
        <td class="right">{{this.qty}}</td>
        <td class="right">${{this.rate}}</td>
        <td class="right">${{this.amount}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <!-- TOTALS -->
  <div class="totals">
    <div class="totals-box">
      <div class="totals-row"><span class="label">Subtotal</span><span class="val">${{subtotal}}</span></div>
      <div class="totals-row"><span class="label">Tax</span><span class="val">${{tax}}</span></div>
      <div class="totals-row total"><span class="label">TOTAL DUE</span><span class="val">${{total}}</span></div>
    </div>
  </div>

  <!-- PAYMENT INSTRUCTIONS -->
  <div class="pay-row">
    <div class="pay-card">
      <h3>PAYMENT INSTRUCTIONS</h3>
      <p>Make checks payable to: <strong>John W. Johnson</strong></p>
      <p>For questions about this invoice, contact John directly:</p>
      <p>325-273-2203 &nbsp;•&nbsp; john@mastercleanhq.com</p>
    </div>
    <div class="pay-card">
      <h3>AMOUNT &amp; DUE DATE</h3>
      <p>Amount Due: <span class="due">${{total}}</span></p>
      <p>Due Date: <strong>{{due_date_long}}</strong></p>
      <p>Payment Terms: Net 15</p>
    </div>
  </div>

  <!-- TERMS -->
  <div class="terms">
    <h4>TERMS &amp; NOTES</h4>
    <ul>
      <li>Payment due within 15 days of invoice date.</li>
      <li>Please reference Invoice # {{invoice_number}} with payment.</li>
      <li>Thank you for the opportunity to serve {{business_name}}.</li>
    </ul>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="thanks">Thank you, {{contact_name_first}} — it was a pleasure serving the {{facility}}.</div>
    <div class="contact">Master Commercial Clean &nbsp;•&nbsp; 325-273-2203 &nbsp;•&nbsp; john@mastercleanhq.com &nbsp;•&nbsp; mastercleanhq.com</div>
  </div>

</div>
</body>
</html>
```

### Placeholder legend

| Placeholder | Example |
|---|---|
| `{{invoice_number}}` | `VBHS-INV-003` |
| `{{issue_date_long}}` | `May 31, 2026` |
| `{{due_date_long}}` | `June 15, 2026` |
| `{{business_name}}` | `Veribest High School` |
| `{{facility}}` | `Field House + Agriculture Classroom` |
| `{{facility_long}}` | `High School Field House + Agriculture Classroom` |
| `{{contact_name}}` | `Mandy Traylor` |
| `{{contact_name_first}}` | `Mandy` |
| `{{city_state}}` | `Veribest, Texas` |
| `{{service_label}}` | `Recurring Cleanup Service` or `One-Time Deep Clean` |
| `{{period_range}}` | `May 1 – May 31, 2026` |
| `{{date_performed}}` | `April 2026` (deep clean only) |
| `{{subtotal}}` / `{{tax}}` / `{{total}}` | `1,000.00` / `0.00` / `1,000.00` |
| `{{line_items}}` | array with `{ title, subtitle?, qty, rate, amount }` |
| `{{logo_url}}` | path to Master Commercial Clean logo image — host it in `/public/img/logo.png` |
| `{{recurring}}` / `{{deep_clean}}` | boolean flags driving the conditional sections |

---

## Definition of done for v2

- [ ] Melissa and James can open `/checkin` on their phones and tap their button to log a visit.
- [ ] Duplicate check-ins for the same worker on the same day are prevented.
- [ ] Dashboard shows the correct monthly visit count and running total ($250 × count).
- [ ] "Generate Invoice for Mandy" creates a `VBHS-INV-00N` draft with one line per visit date at $250 each.
- [ ] Invoice detail page renders with the exact template above and prints cleanly to one page (or flows to two if many line items).
- [ ] Invoice history shows `VBHS-INV-001` (the seeded field house deep clean, paid), `VBHS-INV-002` (the seeded Field House recurring invoice, sent), `VBHS-INV-003` (the Agriculture Classroom deep clean, draft), plus any new invoices.
- [ ] "Mark as Sent" / "Mark as Paid" toggle updates status.
- [ ] Owner dashboard is gated by PIN `0000` (placeholder — real auth comes later).

---

## Out of scope for v1 (explicit)

- Additional clients beyond Veribest
- Worker login / accounts
- Payment processing (Stripe, ACH, etc.)
- Email sending (we copy the invoice link manually for now)
- Expense tracking, tax calculation, profit reporting
- Photo upload of cleaned areas
- Scheduling / calendar integration

We'll layer these on in v2+.
