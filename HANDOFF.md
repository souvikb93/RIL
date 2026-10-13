# HANDOFF — EmPowerPlan (redesign)

## Goal
A UX redesign concept of RLI's **EmPowerPlan** tool for the Oderland-Spree planning region (Brandenburg). The aim is to replace the original 5-step wizard with a clear, question-led dashboard: simpler flow, strong hierarchy, Brandenburg CD colours, EN/DE, desktop and mobile.

- **Live:** https://empower-swart.vercel.app (Vercel project `empower`; every push to `main` auto-deploys)
- **Repo:** https://github.com/souvikb93/RIL (`main`)
- **Local:** `python3 -m http.server 4330` in the repo, or the preview entry `energiewende-kompass` in `~/.claude/launch.json`

## State (all live, QA'd 2026-10-13)
**Login** (`index.html`)
- FarmDoc-style 60/40 split: LottieFiles "wind turbines and solar panels" animation on the left, sign-in on the right.
- Email, Google and Apple all enter the app. **There is no real auth.** A typed email's name part becomes the avatar initial.

**Welcome** (after login)
- "Hi {name}, welcome back" (or "Welcome to EmPowerPlan").
- Three pricing-style cards: **Today / Plan / My Place**. Each has a key number, 3 points and an "Explore" button.
- Cards lift on hover. The picked card zooms forward and the others step back.

**Map page**
- Left panel per topic:
  - **Today:** Energy / Land / Demand tabs with 3 options each. The map updates live; there is no submit button.
  - **Plan:** screen 1 is the starting point (Today / BB 2030 / BB 2040 / Custom). Screen 2 has the sliders: wind and ground solar up front, rooftop and demand under "More settings". Each slider has preset ticks.
  - **My Place:** searchable combobox over 266 OSM places (keyboard support, clear button), or click the map.
- KPI card row:
  - Context card first, then Renewable share, Wind turbines, Land for wind and For municipalities.
  - Values count up. Bars show a today tick and target lines.
  - Clicking a card opens a detail drawer (× / Esc / backdrop to close). The context card jumps to the starting-point screen.
- Map: MapLibre + OpenFreeMap positron, real district outlines, a hex suitability grid, a Layers popover (3 groups, "soon" items disabled), and a legend.

**Pages** (user menu)
- **Documentation** and **Contact**, EN and DE, in `js/pages.js`.
- Written in our own words, with links to RLI's originals (ReadTheDocs, GitHub, apipe, publications, partners).
- Contact shows only RLI's institutional address and main phone. Individual staff contacts are deliberately not copied; the page links to the original app instead.

**Mobile** (< 900 px)
- The panel becomes a draggable bottom sheet (peek / half / full, flick to snap).
- KPIs become a swipe strip.
- The drawer and Layers become bottom modals with a backdrop, one at a time.
- The legend becomes a chip; zoom is by pinch.
- 44 px touch targets, 16 px inputs (no iOS zoom), safe-area insets.

**i18n**
- `js/i18n.js`: EN + DE, natural German with formal "Sie", German number formats.
- Switcher "EN ⌄" → Deutsch / English, saved in localStorage `lang`. The first visit follows the browser language.
- Switching reloads; view, scenario and sliders survive via the URL hash.

**Micro-animations**
- useanimations.com Lottie JSON (MIT, licence in `assets/anim/`), played by `js/anim.js`.
- Used for: checkmarks, radio buttons, checkboxes, search-to-×, loader, warning, info, back arrow.
- Respects reduced motion.

## Files
```
index.html / app.html           login / app
css/tokens.css                  palette, buttons, scrollbars, language switcher
css/login.css, css/app.css      page styles (mobile block at the end of app.css)
js/i18n.js                      EN/DE dictionaries, t(), switcher
js/pages.js                     Documentation + Contact content
js/login.js, js/anim.js, js/app.js
data/                           district boundaries (GADM), OSM settlements
assets/                         logo-mark.png, favicon.png, login-animation.json, anim/
DESIGN.md                       colour rules, layout principles, copy + accessibility rules
```

## Decisions
- **Name "EmPowerPlan"** (at the user's request; same as RLI's tool). The wordmark is EmPower + "Plan" in Brandenburg-Rot, with the leaf-bulb mark. Because the name matches the original, the "independent redesign" note in Docs, Contact and Assumptions must stay. Never use the state coat of arms.
- **Copy** (details in DESIGN.md):
  - Sentence case by default.
  - Title Case for the feature names Today / Plan / My Place and for input labels.
  - No forced uppercase.
  - CTAs are verb + noun, 3 words or fewer.
  - Helper text is device-neutral ("select", not "click").
  - Legend rows stay in sentence case (descriptions, not names).
- **Accessibility:**
  - Content text 12 px or larger, at 4.5:1 contrast or better.
  - Input borders at 3:1.
  - The closed drawer is `visibility: hidden`.
  - The Explore buttons announce their card's question.
  - Focus is visible; reduced motion is respected.
- **No Share/Print buttons and no disclaimer banner.** No submit button for view toggles.
- **Cache-busting:** local CSS/JS use `?v=YYYYMMDDHHMM`. **Bump it on every release.**

## QA done (2026-10-13)
- **Responsive:** 320, 375, 768, 1024, 1440 and 1920 px in EN and DE. No sideways overflow and no clipped labels.
- **Live end-to-end:** desktop EN and mobile DE. Login, welcome, all three topics, presets/custom/reset, drawer, Layers, one-modal rule, place search, Docs/Contact, language switch. No console errors.
- **Links:** all outbound links return 200, except the Zenodo DOI (403 to scripts only, fine in a browser).
- **Accessibility audit:** no duplicate IDs, all inputs labelled, images have alt, headings in order, `lang` set.

## Caveats
- **Simulated:** the wind resource, nature/forest layer and suitable-land analysis (`field()` in `js/app.js`). **Estimated:** district values and today's demand. **Derived by us:** the BB 2040 values. All of this is stated in Assumptions.
- The land warning practically never fires, because the demo suitable area (~214k ha) is far above any slider value. It will matter once real data is in.
- In the Claude preview pane, MapLibre doesn't render while the pane is hidden. Front the tab before screenshots.

## Next
1. Real exclusion data: protected areas, forest, regional-plan wind zones, MaStR existing plants. This will make the land warning meaningful.
2. Per-municipality boundaries, so § 6 EEG income is split per Gemeinde.
3. A scenario choropleth: which districts change under the plan.
4. Optional: a "Find a town" search in the top bar (proposed; the user hasn't decided).
5. Real authentication, if this moves beyond a prototype.
