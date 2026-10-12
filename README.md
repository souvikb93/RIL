# EmPower

A desktop prototype for planning wind and solar in the Oderland-Spree region (Brandenburg). It is a UX redesign concept based on RLI's [EmPowerPlan](https://epp.rl-institut.de/de/) tool.

- **Login** (`index.html`): demo only. Every option opens the app.
- **App** (`app.html`): step 1, pick a question (Today / Plan / My place). Step 2, explore it on one map, with live KPI cards.

## Run locally
```bash
python3 -m http.server 4330
```
Then open http://localhost:4330.

## Deploy
This is a static site with no build step. Import the repo in Vercel with framework preset **Other**. The output directory is the repo root. `vercel.json` turns on clean URLs (`/app`).

## Structure
```
index.html            login (split layout, Lottie left)
app.html              dashboard
css/tokens.css        shared palette, buttons, scrollbars
css/login.css         login page
css/app.css           app
js/login.js           demo sign-in + Lottie loader
js/app.js             model, map, UI
data/                 district boundaries (GADM) + OSM settlements
assets/               logo, login animation (LottieFiles: "Wind turbines and solar panels energy")
DESIGN.md             colour rules, Gutenberg layout, Norman principles
```

## Data honesty
District values are estimates. Wind resource and nature/forest areas are **simulated** to show the principle. The app's "Assumptions & data sources" panel lists every number. This is not a service of the State of Brandenburg.
