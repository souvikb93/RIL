# HANDOFF — EmPower

## Goal
A desktop UX-redesign MVP of RLI's EmPowerPlan tool (Oderland-Spree, Brandenburg). The aim is simpler steps, clearer hierarchy and a dashboard feel, in Brandenburg CD colours. The repo is github.com/souvikb93/RIL, to be deployed on Vercel as a static site.

## State
- `index.html`: login page with a FarmDoc-style 60/40 split. The LottieFiles "wind turbines and solar panels" animation is on the left. The right side has email, Google and Apple, and **all three just open the app** (no auth). The name entered is kept in sessionStorage for the avatar.
- `app.html`: top bar (logo, EmPower, region chip, user menu with Sign out). The left panel has a stepper with **Step 1 → question cards** and **Step 2 → Today / Plan / My place** with a back link. The main area has a KPI card row (context card plus 4 metrics with ▲▼ pills and target meters) above the map.
- Custom: searchable place combobox (keyboard support, highlights matches), Layers popover, user menu, thin scrollbars.
- Local preview: `energiewende-kompass` in `~/.claude/launch.json` (port 4330).

## Files
See README.md for the structure. Colour rules and principles are in DESIGN.md.

## Changed / decided
- Desktop only (min-width 1200), at the user's request.
- Removed the Share and Print CTAs and the "independent prototype" banner. The disclaimer now lives in the Assumptions panel.
- App name "EmPower" with no tagline. The logo is a generic turbine in a Brandenburg-Rot box (not the coat of arms).

## Failed / caveats
- Wind resource and nature layers are simulated (`field()` in js/app.js). District values are estimates.
- MapLibre doesn't render while the browser pane is hidden. Front the tab before screenshots.
- overpass-api.de returned 406; the kumi mirror worked.

## Next
1. Real exclusion data (protected areas, forest, regional plan zones, MaStR plants).
2. A scenario choropleth (which districts turn dark under the plan).
3. Municipality boundaries for per-municipality § 6 EEG.
