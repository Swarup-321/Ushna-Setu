# Ushna Setu (उष्ण सेतु)
### Ward-Level Heatwave Early Warning & Human Thermal Stress Platform
**Smart India Hackathon 2026 · PS26083 · Ministry of Earth Sciences (NCMRWF) · Disaster Management**

---

## 🌟 Product Overview
**Ushna Setu** (*"Heat Bridge"*) transforms raw meteorological forecasts into an actionable, ward-level decision support system. It bridges the gap between weather observation and municipal intervention by computing biological thermal stress, estimating vulnerability-weighted hospitalization risk, and enabling one-click civic action dispatch.

---

## 🚀 Key Features

### 1. Dual-Surface Architecture
- **Authority / Admin Console (Desktop-First)**: Designed for municipal health officers and disaster management authorities.
  - Interactive Leaflet GIS choropleth map with continuous IMD/NDMA risk gradients.
  - Priority Ward ranking based on composite Heat-Health Risk Scores (0–100).
  - Three inspection stat blocks: NOAA Heat Index, Outdoor WBGT, and Composite HTSI with formula inputs.
  - **Auditable Civic Action Triggers**: Instant activation of Municipal Cooling Centres, outdoor work moratoria, and power grid stress alerts.
  - **Emergency Alert Dispatch Gateway**: Mocked/live API integration (Twilio / Gupshup sandbox) for SMS & WhatsApp broadcasts.
  - **Scientific Methodology Screen**: Formal mathematical equations and citations for evaluation credibility.
- **Citizen App (Mobile-First)**: Designed for citizens, outdoor laborers, and ASHA field health workers.
  - Live temperature & "feels like" WBGT display.
  - Role-specific action advisories: General Public, Senior Citizens (60+), Outdoor Workers, and Caregivers/Children.
  - **Text-to-Speech (TTS) Voice Reader**: Audio broadcast of risk level and survival steps via Web Speech API.
  - **Multi-Language Localization**: English, Hindi (हिन्दी), Marathi (मराठी), and Tamil (தமிழ்).
  - **Emergency Hub**: One-tap 108 ambulance dispatch, nearest cooling centres, and plain-language heat-stroke first aid.

---

## 🔬 Scientific Formulations & Citations

1. **NOAA Heat Index (Rothfusz Multi-Variable Polynomial Regression)**:
   $$\text{HI} = f(T_{\text{ambient}}, \text{RH}) \text{ with dry/humid air adjustments}$$
   *Citation: NOAA Technical Attachment SR 90-23 (1990).*

2. **Outdoor Wet Bulb Globe Temperature (WBGT)**:
   $$\text{WBGT}_{\text{outdoor}} = 0.7 \cdot T_w + 0.2 \cdot T_g + 0.1 \cdot T_a$$
   Utilizes Stull (2011) psychrometric approximation for wet-bulb $T_w$ and black-globe radiant load $T_g$.
   *Citation: ISO 7243:2017 & Kumar et al. (2026).*

3. **Composite Human Thermal Stress Index (HTSI)**:
   $$\text{HTSI} = 0.50 \cdot \text{norm}(\text{WBGT}) + 0.30 \cdot \text{norm}(\text{HI}) + 0.20 \cdot \text{norm}(\text{Solar})$$

4. **Heat-Health Risk Score (0–100)**:
   $$\text{RiskScore} = \min\left(100, \text{HTSI} \times \left[1 + 0.55 \cdot \left(0.45 \frac{\text{Elderly}\%}{25} + 0.35 \frac{\text{Labor}\%}{45} + 0.20 \frac{\text{Informal}\%}{50}\right)\right]\right)$$
   *Citations: Sudharsan et al. (2025, Lancet Planetary Health), Kacker et al. (2025/2026), Banerjee et al. (2024).*

5. **Random Forest 5-Day Forecaster**:
   Multi-horizon regressor trained on lagged meteorological variables and urban heat island (UHI) factors.

---

## 🛠️ Tech Stack & Execution

- **Backend**: Python 3.12, FastAPI, Uvicorn, Scikit-Learn, NumPy.
- **Frontend**: React 19, Vite, Leaflet GIS, Lucide-React, Vanilla CSS design tokens.
- **Pilot City**: Ahmedabad Municipal Corporation (AMC) — 18 wards with GeoJSON polygons, demographic data, cooling centres, and trauma hospitals.

### Quick Start:

1. **Backend Server**:
   ```bash
   cd backend
   python -m uvicorn main:app --host 127.0.0.1 --port 8000
   ```

2. **Frontend Client**:
   ```bash
   cd frontend
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.
# sih
# sih
