# Design rules — Energy Transition Compass

## Colour system (5 categories, nothing outside them)

| Category | Colour | Used for | Never used for |
|---|---|---|---|
| **Brand & limits** | Brandenburg-Rot `#E60000` | Top brand bar, logo, region outline, target lines, "over the limit" warnings | Data values, buttons, decoration |
| **Interface** | Navy `#214152` + neutrals (`#1b2830` ink, `#5a6a74` muted, `#dde3e7` line, `#f3f5f6` bg) | Text, primary buttons, selected tab/chip, focus | Energy data |
| **Energy** | Wind `#037E9E` (blue = air) · Solar `#FFD800` (yellow = sun) · Rooftop solar `#F2B705` | Everything about wind or solar, everywhere: sliders, map areas, mix bar, legend | Anything else |
| **Context layers** | Nature `#66CC66` (green = nature) · Settlements `#8e9aa1` (grey = built) | Optional map layers | Results |
| **Data scale** | 5 navy tints `#e6edf1 → #214152` | Choropleth ("more = darker") | Categories |

Rules
- **Existing vs. new** is the same hue: existing = 45 % opacity, new = full colour + darker outline of that hue. No extra colours.
- **Changes are neutral.** Deltas use navy with ▲/▼, not green/red, because "more demand" isn't good and "less coal" isn't bad. Red stays reserved for limits.
- **Colour is never the only signal.** Arrows, outlines and labels carry the same meaning.
- Palette source: MLUK Brandenburg CD Manual 2022 (Farbklima); house typeface Arial.

## Gutenberg diagram (left-to-right, top-to-bottom reading)

| Area | What sits there |
|---|---|
| Primary optical area (top-left) | Mode tabs + the **one hero number** that answers the mode's question |
| Strong fallow (top-right) | Secondary tools: Share link, Layers |
| Weak fallow (bottom-left) | Reference: legend, assumptions & sources |
| Terminal area (bottom-right) | The **next step** button: Plan → Check a place → Create report |

## Norman's principles, applied

| Principle | How it shows up |
|---|---|
| **Conceptual model** | Three modes = three questions people already ask: *Where do we stand? What if we build more? What does it mean for my place?* |
| **Visibility** | All selectable options are listed (incl. disabled "soon" items) instead of hidden in a 20-item dropdown |
| **Feedback** | Every slider move updates hero number, map and deltas instantly; toast on share |
| **Mapping** | Slider right = more; tabs left→right follow the workflow; controls sit next to what they change |
| **Constraints** | Slider ranges are bounded; "soon" options are disabled; warning when a scenario needs more land than is suitable |
| **Signifiers / affordances** | Crosshair cursor + hint on the map in My place; handles on sliders; buttons look like buttons |
| **Consistency** | One colour per meaning (above); same map in every mode; same number format everywhere |
| **Error recovery** | "Back to …" resets a custom scenario to its preset in one click |

## Information hierarchy per mode
1. Hero number (largest)
2. 2–3 supporting numbers
3. Controls (primary only)
4. Collapsed: more settings, more results, sources
