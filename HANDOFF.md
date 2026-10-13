# HANDOFF — EmPowerPlan (redesign)

## Goal
A UX-redesign MVP of RLI's EmPowerPlan tool (Oderland-Spree, Brandenburg): simpler flow, clear hierarchy, dashboard feel, Brandenburg CD colours.
- Repo: github.com/souvikb93/RIL (`main`)
- Live: https://empower-swart.vercel.app (Vercel project `empower`, auto-deploys on push)

## State
- **Login** (`index.html`): FarmDoc-style 60/40 split with the LottieFiles wind/solar animation. Email, Google and Apple all enter the app (no auth). EN/DE switcher.
- **Welcome** (after login): greeting plus three "pricing-style" cards (Today / Plan / My place), each with an "Explore" button. Cards zoom on pick.
- **Map page:**
  - Left panel views: Today (Energy / Land / Demand tabs, 3 options each); Plan (starting point → sliders); My place (searchable combobox).
  - KPI card row: count-up values, today tick, target lines. Clicking a card opens a detail drawer.
- **Mobile** (< 900 px):
  - The panel becomes a draggable bottom sheet (peek / half / full).
  - KPIs become a swipe strip.
  - The detail drawer and Layers open as bottom modals with a backdrop.
  - The legend becomes a chip.
- **Micro-animations:** useanimations.com Lottie JSON (MIT) played via lottie-web (`js/anim.js`).
- **Docs & Contact** (user menu): full pages in EN/DE (`js/pages.js`), written in our own words with links to RLI's originals. Only institutional contact details are shown; individual RLI staff contacts are deliberately not copied. Both pages say this is an independent redesign.
- **i18n:** `js/i18n.js`, EN + DE (formal "Sie"). Keys use `data-i18n*` attributes in markup and `t()` in scripts. The choice is stored in localStorage `lang`; switching reloads the page, and state survives via the URL hash.

## Files
`index.html`, `app.html`, `css/{tokens,login,app}.css`, `js/{i18n,pages,login,anim,app}.js`, `data/`, `assets/` (logo, favicon, login Lottie, `anim/`). Colour rules and UX principles are in DESIGN.md.

## Decisions
- Name "EmPowerPlan" (same as RLI's tool, at the user's request): wordmark EmPower + "Plan" in red, leaf-bulb logo. No coat of arms. Because the name matches the original, the "independent redesign" note in Docs/Contact/Assumptions must stay.
- Copy: sentence case everywhere, with no forced uppercase. Feature names are Title Case: Today / Plan / My Place. German is natural, not literal, and uses formal "Sie".
- Accessibility: content text ≥ 12px, no text below 4.5:1, input borders 3:1, closed drawer is `visibility: hidden`, reduced motion respected.
- No submit buttons for view toggles (instant feedback). CTA labels follow verb + noun, ≤ 3 words. Copy is sentence case.
- Local CSS/JS carry `?v=YYYYMMDDHHMM`. **Bump it on every release** or browsers may serve stale JS.

## Caveats
- Wind resource and nature layers are simulated. District values are estimates.
- MapLibre doesn't render while the browser pane is hidden; front the tab before screenshots.

## Next
1. Real exclusion data (protected areas, forest, regional plan zones, MaStR).
2. Per-municipality boundaries for § 6 EEG.
3. A "Find a town" search in the top bar (proposed; awaiting the user's decision).
