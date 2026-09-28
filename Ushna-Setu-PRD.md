# Product Requirements Document
## Ushna Setu — Ward-Level Heatwave Early Warning & Human Thermal Stress Platform
**SIH 2026 · PS26083 · Ministry of Earth Sciences (NCMRWF) · Theme: Disaster Management**

Prepared for: build handoff to an AI coding agent (Antigravity / Claude Code / similar)
Version: 1.0

---

## 1. Product Vision

Most heat-warning tools (including the two reference builds we studied — a citizen weather app and a ward heat-map dashboard) stop at "here is the temperature." Ushna Setu ("Heat Bridge") is the layer NCMRWF's problem statement actually asks for: a system that turns raw weather into **who is at risk, where, and what an authority should do about it in the next 3–5 days** — then closes the loop by actually pushing the alert and the administrative action.

**One-line pitch:** *From forecast to intervention — a ward-level heat-health risk engine that tells a municipal officer which wards to act on today, and tells a citizen what to do right now.*

**What makes this distinct from what's already been built by others:**
- A real, cited thermal-stress computation (HI + WBGT + a documented composite HTSI), not a black-box "index"
- A Random Forest / ML layer producing an actual **3-day and 5-day forecast**, not just today's snapshot
- A **Heat-Health Risk Score (0–100)** that fuses the thermal indicator with ward-level *vulnerability* (elderly %, outdoor worker density, population density) — this is the mortality/hospitalization-risk proxy the PS explicitly asks for
- Two distinct front ends for two distinct users: a **citizen app** and an **authority/admin console** — most hackathon builds only do one
- A working (even if mocked) **alert dispatch API** (SMS/WhatsApp) and an **administrative action layer** (cooling centre activation, outdoor-work advisory, grid-stress flag) — the part of the PS everyone skips because it's not visually flashy

---

## 2. Users & Personas

| Persona | Needs | Primary surface |
|---|---|---|
| **Citizen / Outdoor worker** | "Is it safe to go out today? What should I do?" in their own language | Citizen App |
| **Field health worker / ASHA** | Which households/wards to check on today | Citizen App (field mode) |
| **Ward/Municipal Health Officer** | Which wards are entering high risk, who's vulnerable there, what action to trigger | Admin Console |
| **Disaster Management Authority (city/district)** | City-wide risk overview, trend over 5 days, one-click action triggers | Admin Console |
| **NCMRWF / researcher (secondary)** | Validate the index methodology, export data | Admin Console → Data/Methodology tab |

---

## 3. Scope

### In scope for the hackathon prototype (build this)
- Thermal index engine: Heat Index, WBGT (estimated), composite HTSI (0–100)
- Ward-level risk classification (Low/Moderate/High/Very High) for one pilot city (recommend Pune/PCMC or Ahmedabad — both have public ward shapefiles)
- 3-day and 5-day forecast trend (can be ML-driven where data exists, rule/regression-driven as fallback — be honest about this in the demo)
- Vulnerability layer using publicly available Census/ward demographic proxies
- Two UIs: Citizen App + Admin/Authority Console (detailed in Section 6–7)
- Mocked-but-functional alert API (actually calling Twilio/Gupshup sandbox counts as "working"; a documented REST contract with a stub response is the fallback)
- Multi-language toggle (English + Hindi minimum; Marathi/Tamil if time allows)

### Explicitly out of scope for the hackathon (mention as future scope only)
- Full IoT sensor network integration
- Production-grade mortality model trained on real hospital records (use literature-calibrated coefficients instead, and say so)
- Multi-city scaling infrastructure

---

## 4. Information Architecture

```
Ushna Setu
├── Public / Citizen App
│   ├── Home (today's risk, at a glance)
│   ├── Forecast (5-day outlook)
│   ├── Map (ward risk map, "am I in a hot zone")
│   ├── Advisory (what to do — role-specific: elderly / outdoor worker / general)
│   ├── Emergency (nearest cooling centre, hospital, one-tap call)
│   └── Settings (language, location, accessibility/voice)
│
└── Authority / Admin Console
    ├── City Overview (risk heat-map, priority ward ranking)
    ├── Ward Detail (drill-down: indices, vulnerability, population, trend)
    ├── Forecast & Trends (3-day / 5-day, threshold-crossing alerts)
    ├── Actions (trigger cooling centre / work-hour advisory / grid flag — logged, auditable)
    ├── Alerts Sent (log of SMS/WhatsApp pushes, delivery status)
    └── Methodology (how HTSI/WBGT/risk score are computed — for credibility with NCMRWF judges)
```

---

## 5. Design System — "eye-nourishing," not generic-AI

We are explicitly avoiding the two most common failure modes in hackathon dashboards: (a) the templated SaaS-card look with identical rounded cards and soft grey shadows everywhere, and (b) an overly clinical government-form look. This is a **disaster-response instrument** — it should feel calm, authoritative, and legible under stress, with the heat-risk data itself as the one place we allow visual intensity.

### 5.1 Design principle
One area of the UI is allowed to be visually loud: **the risk gradient itself** (green → yellow → orange → red on the map and index badges). Everything else — chrome, navigation, typography, cards — stays quiet, structured, and low-saturation so the risk color reads instantly against it. This is a real design decision, not decoration: in an emergency-response tool, color must mean something, and it only means something if it's rare everywhere else.

### 5.2 Color tokens

**Base / chrome (quiet, low-saturation — evokes dusk sky before a heat day, not generic SaaS grey):**
- `--ink-900: #1C2431` — primary text, headers
- `--slate-700: #3D4759` — secondary text
- `--slate-400: #8892A6` — muted text, placeholders
- `--mist-100: #F3F1EC` — app background (warm-neutral paper, not stark white or the AI-cliché cream)
- `--surface-0: #FFFFFF` — card/panel surface
- `--line-200: #E4E1D8` — hairline borders/dividers

**Brand accent (used sparingly — for primary actions, active nav, links only):**
- `--dusk-600: #2B4C63` — deep teal-blue, "the cool relief" — primary buttons, active states, links

**Risk gradient (the ONE place saturation lives — matches NDMA/IMD heat-alert convention so it reads instantly to officials):**
- `--risk-low: #4E9F5B` (green)
- `--risk-moderate: #E3B341` (yellow/amber)
- `--risk-high: #E07A3F` (orange)
- `--risk-extreme: #C1443C` (red)
- Use a continuous interpolated gradient for the map (not just 4 flat bands) so ward-to-ward variation is visible; use the 4 flat tokens for badges/chips/legends.

### 5.3 Typography
- **Headlines / numbers (the risk score, temperatures):** *Fraunces* (a warm, slightly serif display face with real personality — avoids both generic sans-only dashboards and the tracked-out ALL-CAPS eyebrow-label cliché). Use tabular figures for all numeric displays so numbers don't jitter when they update.
- **Body / UI text:** *Inter* or *IBM Plex Sans* — chosen because IBM Plex has a companion Devanagari/Indic-adjacent design ethos and pairs well when Hindi/Marathi text is toggled in; keeps visual consistency across languages.
- Scale: 40/32/24/18/16/14px, line-height 1.5 for body, 1.15 for display numbers.
- No all-caps labels. Use sentence case throughout — "Change address," not "CHANGE ADDRESS."

### 5.4 Layout concept
Sidebar-left, content-right for the Admin Console (officers live in this tool for hours — persistent nav matters). Bottom-tab for the Citizen App (mobile-first, thumb reach).

```
ADMIN CONSOLE (desktop)                    CITIZEN APP (mobile)
┌───┬────────────────────────┐             ┌─────────────────┐
│   │  Ahmedabad Municipal    │             │  ≡  Ushna Setu  │
│ N │  Corp          🔔 👤   │             ├─────────────────┤
│ A ├────────────────────────┤             │   Today: 27°C   │
│ V │  [Ward Map — large,    │             │   ●  MODERATE   │
│   │   risk-colored]        │             │   Feels like    │
│   │                        │             │   32° WBGT      │
│   │  Priority Wards ▸      │             │                 │
│   │  1. Ward 19  Extreme   │             │  [Advisory card]│
│   │  2. Ward 14  High      │             │                 │
│   │  3. Ward 27  High      │             │  [5-day strip]  │
│   │                        │             ├─────────────────┤
│   │  [Trend chart 5-day]   │             │ 🏠  🌡️  🗺️ 🆘 ⚙️ │
└───┴────────────────────────┘             └─────────────────┘
```

Alignment: left-aligned text throughout (this is a working tool, not a marketing page — center-alignment is reserved for empty states and the single hero number on the citizen home screen).

### 5.5 Components (reuse these everywhere, don't invent new card styles per screen)
- **Risk Badge** — pill, filled with risk-gradient color, white text, used for ward chips, forecast days, alert severity
- **Index Card** — a stat block for HI / WBGT / HTSI: big Fraunces number, small label below, no icon-in-a-circle cliché — instead a thin colored left-border matching the risk token
- **Ward Row** — used in priority lists: rank, ward name, risk badge, one-line vulnerability note ("38% elderly population")
- **Action Trigger** — a control in the Admin Console with three states: Not triggered / Triggered (timestamp + officer name) / Auto-suggested — never a bare button with no state memory, since these are auditable civic actions
- **Advisory Card** — citizen-facing, role-tabbed (General / Elderly / Outdoor worker / Child), plain-language, 2–3 concrete actions max, no medical jargon

### 5.6 Motion
One deliberate moment only: when risk crosses a threshold (e.g., ward goes Moderate → High), the badge does a single soft pulse-and-settle, not a looping animation. No hover-lift on every card — reserve interaction feedback for things that are actually clickable and consequential (Action Triggers, ward rows).

### 5.7 Accessibility & localization (explicit PS/competitor gap to close)
- Language toggle: English, Hindi, Marathi, Tamil minimum (matches what the competitor citizen app already showed — must match or exceed)
- Voice-reader for the citizen Home and Advisory screens (TTS reads out today's risk + top advisory line) — competitor had this, don't skip it
- Color is never the only signal — every risk badge carries a text label (LOW/HIGH/etc.), not color alone, for color-blind accessibility
- Minimum tap target 44px on citizen app; test at 360px width minimum

---

## 6. Core Screens — detailed spec for the build agent

### 6.1 Citizen App — Home
- Top: location chip (auto-detected or manually searched), tap to change
- Hero: current temperature, "feels like" WBGT, and the risk badge, in that order of visual weight (temperature large, WBGT below it in dusk-teal, badge as a pill)
- Below hero: one Advisory Card matched to the citizen's selected profile (ask once at onboarding: General / Elderly / Outdoor worker / Caregiver)
- 5-day forecast strip: horizontally scrollable day chips, each showing max temp + WBGT + risk badge (mirrors the reference screenshot's table, but as a scannable strip, not a dense table, since this is mobile-first)
- Bottom tab bar: Home / Forecast / Map / Emergency / Settings

### 6.2 Citizen App — Map
- Full-bleed ward-risk map (Leaflet), user's own location pinned
- Tapping a ward opens a bottom sheet: ward name, current risk, nearest cooling centre + hospital with one-tap "Get directions" / "Call"

### 6.3 Citizen App — Emergency
- Large one-tap "Call Emergency Services" (108) button, high-contrast, always reachable in one tap from anywhere via a persistent floating action button, not buried in a tab
- List of nearby cooling centres and hospitals with distance and open/closed status
- Basic first-aid steps for heat exhaustion / heat stroke, written in plain sentence-case steps, not a dense paragraph

### 6.4 Admin Console — City Overview
- Large ward-risk map as the hero (this is the "characteristic first thing" per design principle — an official opens this tool to see the map first)
- Right/below: Priority Wards list, ranked by risk score descending, each row showing the Ward Row component
- Below map: 5-day city-wide trend chart (line chart, predicted risk vs. threshold line — matches what strong reference decks already showed; keep it, it works)
- Top bar: organization context ("Ahmedabad Municipal Corp"), notification bell (unacknowledged threshold-crossing alerts), user profile

### 6.5 Admin Console — Ward Detail
- Header: ward name, current composite risk score (big Fraunces number, 0–100) with badge
- Three Index Cards side by side: Heat Index / WBGT / HTSI, each with the raw formula inputs visible on hover/tap (temperature, RH, wind, radiation) — this is what will impress NCMRWF evaluators, since it shows the number isn't a black box
- Vulnerability panel: elderly %, outdoor worker density, population density, with a one-line plain-English risk interpretation ("High elderly population + high WBGT → elevated hospitalization risk")
- 5-day forecast trend for this ward specifically
- Action Trigger panel: three toggles — Activate cooling centre / Issue outdoor-work advisory / Flag grid-stress to power utility — each logs officer name + timestamp when triggered

### 6.6 Admin Console — Alerts Sent
- Table: timestamp, ward(s), channel (SMS/WhatsApp), message preview, delivery status
- "Send new alert" button opens a composer: select ward(s) or "all high-risk wards," select language(s), preview message, send — hits the mocked/real alert API

### 6.7 Admin Console — Methodology
- Static but well-designed page explaining, in order: what HI/WBGT/HTSI are, the exact formulas used, data sources, and the vulnerability-weighting logic, with citations to the 5 papers already gathered (Kacker et al. 2025/2026, Kumar et al. 2026, Sudharsan et al. 2025, Banerjee et al. 2024). This single page is what turns a "nice app" into a "credible scientific tool" in judges' eyes — don't skip it, don't rush it.

---

## 7. Data Model (core entities)

```
Ward
  id, name, city_id, geometry (GeoJSON polygon)
  population, elderly_pct, outdoor_worker_density, informal_housing_pct

WeatherObservation
  ward_id, timestamp, temp_c, relative_humidity, wind_speed_ms, solar_radiation_wm2, source

ThermalIndex
  ward_id, timestamp, heat_index, wbgt, htsi (0-100), forecast_horizon (0/3/5 days)

RiskScore
  ward_id, timestamp, thermal_component, vulnerability_component, composite_score (0-100), risk_band (low/moderate/high/extreme)

Alert
  id, ward_ids[], channel (sms/whatsapp), language, message, triggered_by, sent_at, delivery_status

Action
  id, ward_id, type (cooling_centre/work_advisory/grid_flag), triggered_by, triggered_at, status

CoolingCentre / Hospital
  id, ward_id, name, lat, lng, capacity, open_status
```

---

## 8. Core Algorithms (give these to the build agent verbatim as starting logic)

### 8.1 Heat Index (Rothfusz regression, NOAA)
Standard polynomial regression on temperature (°F) and relative humidity (%); implement exactly as published by NOAA, convert output back to °C for display.

### 8.2 WBGT (outdoor, estimated formula)
Since true black-globe sensors won't exist in a hackathon pilot, use the widely-used **Liljegren/ISO 7243-style estimated WBGT** approximation from ambient temperature, humidity, wind speed, and solar radiation (this is the same approach Kumar et al. 2026's Pune field study validates against — cite it in the Methodology screen).

### 8.3 Composite HTSI (0–100) — your own defined index, be explicit that it's project-defined
```
HTSI = w1 * normalize(WBGT) + w2 * normalize(HeatIndex) + w3 * normalize(solar_load)
     (weights w1=0.5, w2=0.3, w3=0.2 — tune and justify in the demo, don't hide that these are chosen)
```

### 8.4 Composite Heat-Health Risk Score (0–100) — the mortality/hospitalization proxy
```
RiskScore = HTSI_normalized * VulnerabilityMultiplier

VulnerabilityMultiplier = 1 + a*(elderly_pct) + b*(outdoor_worker_density) + c*(informal_housing_pct)
     (coefficients a,b,c calibrated against literature dose-response curves —
      cite Sudharsan et al. 2025 and Kacker et al. 2025/2026 in Methodology screen)
```
Be upfront in the pitch: without real local mortality data, this is a **literature-calibrated proxy model**, positioned as a decision-support estimate, not a certified epidemiological prediction. Judges respect this honesty far more than an unexplained black-box "AI risk score."

### 8.5 Forecast (3-day / 5-day)
- Baseline: apply the index formulas to NWP/forecast weather inputs directly (already gives a defensible 3–5 day forecast, since the underlying weather forecast exists)
- Enhancement (if time allows): Random Forest regressor trained on lagged features (as shown in the reference architecture) to bias-correct the ward-level forecast against historical AWS readings

---

## 9. Tech Stack (recommended — merges what's proven to work)

- **Backend:** FastAPI (Python)
- **ML:** scikit-learn (Random Forest), pandas/numpy for feature engineering
- **DB:** PostgreSQL + PostGIS (ward geometries, spatial queries)
- **Cache:** Redis (for repeated map/tile requests)
- **Frontend:** React + Leaflet (map) + Recharts (trend charts)
- **Alerts:** Twilio or Gupshup sandbox for SMS/WhatsApp (a working sandbox call beats a slide claiming "future scope")
- **Data sources:** IMD/ERA5/Open-Meteo for weather, Bhuvan/municipal GIS portals for ward shapefiles, Census 2011 for demographic proxies

---

## 10. Non-Functional Requirements
- Map interactions must stay responsive with up to ~50 ward polygons rendered
- Citizen app must be usable on a low-end Android device on 3G (lazy-load map tiles, keep initial payload small)
- All risk/index numbers must show their calculation inputs on demand (no unexplained numbers anywhere in the UI)
- Every civic Action Trigger must be logged with who/when — auditability matters to a disaster-management buyer

---

## 11. Build Priority for Hackathon Timeline

1. **Must have (demo depends on this):** thermal index engine (HI + WBGT + HTSI) with real formulas, one pilot city's ward map colored by live-computed risk, Admin City Overview + Ward Detail screens, Methodology screen with citations
2. **Should have:** Citizen App Home + Map + Advisory, 5-day forecast trend, Action Trigger logging
3. **Nice to have:** working SMS/WhatsApp sandbox call, multi-language toggle beyond English/Hindi, voice reader

---

## 12. Instructions block — paste this to the coding agent

> Build a two-surface web application: an **Admin Console** (React, desktop-first) and a **Citizen App** (React, mobile-first, can be a responsive mode of the same app). Use the design tokens, typography, layout wireframes, and component list in Section 5–6 of this PRD exactly — do not substitute a generic dashboard template. Implement the thermal index formulas in Section 8 in a Python FastAPI backend with clearly named functions (`compute_heat_index`, `compute_wbgt`, `compute_htsi`, `compute_risk_score`) so each can be inspected and cited on the Methodology screen. Seed the database with one pilot city's ward boundaries (GeoJSON) and mock/historical weather data if live API access isn't available. Prioritize Section 11's "Must have" list first; only proceed to "Should have" once the Admin Console fully works end-to-end with real computed numbers on the map.
