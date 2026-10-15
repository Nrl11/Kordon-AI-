# Kordon AI — website

The website of Kordon AI, an enterprise AI gateway that runs inside a company's own network. Every request from
employees and AI agents to AI models goes through it: Kordon masks personal data and secrets, follows the
privacy laws and languages of each market, picks the model (external or local), enforces budgets, revokes
access and writes an audit log. Audience: CTOs and DevOps, security teams, finance leads.

## Stack

- Next.js 16 (App Router, Turbopack), React 19 with the React Compiler, TypeScript
- CSS Modules; design tokens in `src/app/globals.css`, fonts in `src/app/fonts.ts`
- GSAP for scene animations, Lenis for smooth scrolling
- three.js — only for the 3D scene on the home page

## Run locally

```bash
npm install
npm run dev
```

The site opens at http://localhost:3000.

```bash
npm run build   # production build
npm start       # run the built site
npm run lint    # ESLint (Next and React Compiler rules)
```

## Design rules

- Palette: ink `#0b1324`, cobalt `#2a47d6` (buttons, active states, requests inside the network), gold `#e0b04a` —
  only the Kordon core, masking placeholders and savings; red — leaks and “stop”; green — “allowed”.
- Fonts: Wix Madefor Display (headings, large numbers) and Wix Madefor Text (body and UI; data uses
  `font-variant-numeric: tabular-nums`). No monospace font.
- Every block (heading and scene) fits in the window: a 24″ display at 100% (~1920×920) and a laptop (~1440×800).
  Paddings and sizes are tied to the window height (`vh`).
- Headlines are six words or fewer, sentence case; subheadings have no trailing period (`src/lib/typo.ts`).

## Pages

| Path | What's on it |
| --- | --- |
| `/` | 3D hero, admin portal, masking scene, local laws and languages, deployment, savings, pilot |
| `/security` | layers of protection, research numbers with sources, masking, data classes, prompt injections, how protection is measured |
| `/solutions` | three roles |
| `/solutions/it` | one endpoint with failover, virtual keys, three situations, agents within their role |
| `/solutions/infosec` | live audit log, investigation in one search, rules per data class, audit evidence |
| `/solutions/finance` | scattered bills → one report, spend by model, payment options, calculator, budgets |
| `/pricing` | who counts, license configurator, base and add-ons, license growth over three years, rollout and support |
| `/start` | the pilot request form and FAQ |
| `/privacy` | privacy policy |

Shared parts: header and footer (`components/Nav.tsx`, `Footer.tsx`, site map in `lib/site.ts`), page header,
section, FAQ and the closing block (`components/site`). Scenes advance on their own while visible and pause under
the cursor or keyboard focus (`lib/useCycle.ts`). With “reduce motion” they show their final frames.

## Before launch

- **Company details.** Fill in `LEGAL` in `src/lib/site.ts` — the legal name and an email for privacy requests.
- **Where requests go.** Email and/or a Telegram chat — see `docs/leads-email.md` and `docs/leads-telegram.md`.
- **Privacy policy.** `src/app/privacy/page.tsx` — have counsel review it.
- **Hosting.** `docs/deploy.md` — Vercel, Docker or a Node server behind nginx.
- **Examples.** Requests, log events, keys and team spend are illustrations; the calculator is an example with
  assumptions the visitor can change (`src/lib/costModel.ts`).
