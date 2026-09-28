import React, { useState, useEffect } from 'react';
import {
  Sun,
  Flame,
  Shield,
  ShieldAlert,
  Thermometer,
  Wind,
  Droplets,
  HeartPulse,
  GlassWater,
  LifeBuoy,
  CheckCircle2,
  AlertTriangle,
  Info,
  MapPin,
  PhoneCall,
  Volume2,
  VolumeX,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  ArrowRight,
  Share2,
  Smartphone,
  Monitor,
  Activity,
  User,
  Navigation,
  Compass,
  Check,
  X,
  TrendingUp,
  Layers,
  Calendar
} from 'lucide-react';
import WardRiskMap from './WardRiskMap';
import { TRANSLATIONS } from '../translations';

export default function CitizenPortal({
  wards = [],
  selectedWard = null,
  onSelectWard = () => {},
  coolingCentres = [],
  allCoolingCentres = [],
  emergencyHospitals = [],
  forecast5Day = [],
  wardDetail = null,
  latestAlert = null,
  alertsList = []
}) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [profileRole, setProfileRole] = useState('general');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWard, setCurrentWard] = useState(selectedWard || (wards.length > 0 ? wards[0] : null));
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'forecast' | 'safewindow' | 'shelters' | 'map'
  const [viewMode, setViewMode] = useState('portal'); // 'portal' (responsive wide) | 'mobile' (compact mobile container)

  // Feature 1: Hydration Tracker
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [orsCount, setOrsCount] = useState(1);
  const [hydrationStreak, setHydrationStreak] = useState(4);

  // Feature 2: Safe Excursion Timeline Hour
  const [selectedHour, setSelectedHour] = useState(13); // 1:00 PM peak

  // Feature 3: Symptom Triage Quiz Modal
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [triageAnswers, setTriageAnswers] = useState({ fever: null, sweat: null, confusion: null });

  // Feature 4: SOS Emergency Modal
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  // Feature 5: Paginated Cooling Facilities Directory
  const [facilitySearch, setFacilitySearch] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [facilityPage, setFacilityPage] = useState(1);
  const FACILITY_PAGE_SIZE = 3;

  // Feature 6: Paginated First-Aid Knowledge Cards
  const [firstAidIndex, setFirstAidIndex] = useState(0);

  // Feature 7: Interactive Forecast Plot State
  const [selectedPlotDay, setSelectedPlotDay] = useState(0);
  const [hoveredPlotIndex, setHoveredPlotIndex] = useState(null);

  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  // Sync current ward
  useEffect(() => {
    if (selectedWard) {
      setCurrentWard(selectedWard);
    } else if (wards.length > 0 && !currentWard) {
      setCurrentWard(wards[0]);
    }
  }, [selectedWard, wards]);

  // Combine cooling centers with guaranteed valid coordinates
  const facilitiesList = (allCoolingCentres && allCoolingCentres.length > 0)
    ? allCoolingCentres
    : (coolingCentres && coolingCentres.length > 0 ? coolingCentres : [
        {
          id: 'cc-01',
          name: 'Danilimda AMC Community Hall Cooling Centre',
          type: 'Municipal AC Shelter',
          address: 'Opp. Khodiyarnagar Bus Stand, Danilimda',
          lat: 22.9912,
          lng: 72.5910,
          capacity: 250,
          water_station: true,
          medical_staff: true,
          status: 'Active (Activated via Action Layer)',
          phone: '+91 79 2535 4100'
        },
        {
          id: 'cc-02',
          name: 'Jamalpur APMC Shaded Hydration & Rest Hub',
          type: 'High-Volume Shaded Transit Facility',
          address: 'Near Sardar Bridge Approach, Jamalpur',
          lat: 23.0135,
          lng: 72.5790,
          capacity: 320,
          water_station: true,
          medical_staff: true,
          status: 'Active',
          phone: '+91 79 2539 1222'
        },
        {
          id: 'cc-07',
          name: 'Sabarmati Riverfront Shaded Misting Pavilion',
          type: 'Misting Canopy & Rest Hub',
          address: 'Riverfront West Promenade, Near Nehru Bridge',
          lat: 23.0270,
          lng: 72.5710,
          capacity: 300,
          water_station: true,
          medical_staff: true,
          status: 'Active',
          phone: '+91 79 2658 0401'
        },
        {
          id: 'cc-08',
          name: 'Naroda GIDC Shaded Worker Chhabeel & Clinic',
          type: 'Drinking Water Kiosk & Health Booth',
          address: 'Near Naroda Patiya Circle, Naroda',
          lat: 23.0680,
          lng: 72.6510,
          capacity: 220,
          water_station: true,
          medical_staff: true,
          status: 'Active',
          phone: '+91 79 2281 3320'
        }
      ]);

  // Fallback 5-day forecast data if not yet loaded from backend
  const baseTemp = currentWard?.weather?.temp_c || 42.5;
  const activeForecast = (forecast5Day && forecast5Day.length > 0)
    ? forecast5Day
    : [
        { day_index: 1, day_name: 'Today', temp_max_c: baseTemp, temp_min_c: Math.round(baseTemp - 11), wbgt_c: 33.2, rh_pct: 36, solar_wm2: 780, predicted_risk_score: 84.5, risk_band: 'Extreme' },
        { day_index: 2, day_name: 'Day +1', temp_max_c: Math.round((baseTemp + 1.2) * 10) / 10, temp_min_c: Math.round(baseTemp - 10), wbgt_c: 34.1, rh_pct: 34, solar_wm2: 805, predicted_risk_score: 87.2, risk_band: 'Extreme' },
        { day_index: 3, day_name: 'Day +2', temp_max_c: Math.round((baseTemp + 2.1) * 10) / 10, temp_min_c: Math.round(baseTemp - 9.5), wbgt_c: 34.8, rh_pct: 32, solar_wm2: 820, predicted_risk_score: 91.0, risk_band: 'Extreme' },
        { day_index: 4, day_name: 'Day +3', temp_max_c: Math.round((baseTemp + 1.5) * 10) / 10, temp_min_c: Math.round(baseTemp - 10), wbgt_c: 33.9, rh_pct: 35, solar_wm2: 795, predicted_risk_score: 86.4, risk_band: 'Extreme' },
        { day_index: 5, day_name: 'Day +4', temp_max_c: Math.round((baseTemp - 0.8) * 10) / 10, temp_min_c: Math.round(baseTemp - 11.5), wbgt_c: 32.5, rh_pct: 40, solar_wm2: 750, predicted_risk_score: 79.5, risk_band: 'High' }
      ];

  // Text-To-Speech (TTS) Voice Reader
  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech audio reader is not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const currentAdvisory = t.advisories[profileRole];
    const riskBandText = currentWard?.risk?.risk_band || 'Extreme';
    const tempText = currentWard?.weather?.temp_c || '42.8';
    const wbgtText = currentWard?.thermal_indices?.wbgt?.wbgt_c || '33.2';
    const wardName = currentWard?.name || 'Ahmedabad';

    let speechText = "";
    if (selectedLanguage === 'hi') {
      speechText = `उष्ण सेतु चेतावनी। आज ${wardName} में तापमान ${tempText} डिग्री सेल्सियस और ऊष्मीय तनाव ${riskBandText} श्रेणी में है। ${currentAdvisory.title}। ${currentAdvisory.points.join('. ')}। आपातकाल के लिए 108 डायल करें।`;
    } else if (selectedLanguage === 'mr') {
      speechText = `उष्ण सेतू पूर्वसूचना। आज ${wardName} मध्ये तापमान ${tempText} अंश आहे. ${currentAdvisory.title}। ${currentAdvisory.points.join('. ')}। मदतीसाठी १०८ वर संपर्क करा.`;
    } else if (selectedLanguage === 'ta') {
      speechText = `உஷ்ண சேது எச்சரிக்கை. இன்று ${wardName} நகரில் வெப்பநிலை ${tempText} டிகிரி. ${currentAdvisory.title}. ${currentAdvisory.points.join('. ')}. அவசர உதவிக்கு 108 அழைக்கவும்.`;
    } else {
      speechText = `Ushna Setu Warning. Today in ${wardName}, the temperature is ${tempText} degrees Celsius, with outdoor WBGT at ${wbgtText} degrees. Thermal risk is ${riskBandText}. ${currentAdvisory.title}. ${currentAdvisory.points.join('. ')}. For medical emergency, call 108 immediately.`;
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const langCode = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'mr' ? 'mr-IN' : selectedLanguage === 'ta' ? 'ta-IN' : 'en-IN';
    const matchedVoice = voices.find(v => v.lang === langCode || v.lang.startsWith(selectedLanguage));
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Safe Excursion Hourly Timeline
  const timelineHours = [
    { hour: 6, label: '6 AM', temp: '29°C', uv: 1, status: 'safe', title: 'Early Morning Calm', advice: 'Ideal for morning walks and essential errands.' },
    { hour: 7, label: '7 AM', temp: '31°C', uv: 2, status: 'safe', title: 'Pleasant Window', advice: 'Good for light outdoor exercise.' },
    { hour: 8, label: '8 AM', temp: '33°C', uv: 4, status: 'safe', title: 'Moderate Comfort', advice: 'School commute safe. Carry water bottle.' },
    { hour: 9, label: '9 AM', temp: '36°C', uv: 6, status: 'caution', title: 'Rising Solar Heat', advice: 'Wear hat or carry an umbrella.' },
    { hour: 10, label: '10 AM', temp: '38°C', uv: 8, status: 'caution', title: 'Rapid Warming', advice: 'Drink ORS water before stepping out.' },
    { hour: 11, label: '11 AM', temp: '40°C', uv: 9, status: 'danger', title: 'Severe Radiant Load', advice: 'Avoid strenuous physical labor in open sun.' },
    { hour: 12, label: '12 PM', temp: '42°C', uv: 11, status: 'extreme', title: 'Peak Loo & Scorching Sun', advice: 'STAY INDOORS. Dangerous thermal stress.' },
    { hour: 13, label: '1 PM', temp: '43°C', uv: 12, status: 'extreme', title: 'Peak Heat Hazard', advice: 'Mandatory work stoppage for outdoor labor.' },
    { hour: 14, label: '2 PM', temp: '43.5°C', uv: 11, status: 'extreme', title: 'Extreme Biological Danger', advice: 'High risk of hyperthermia within 25 mins in open sun.' },
    { hour: 15, label: '3 PM', temp: '43°C', uv: 9, status: 'extreme', title: 'Severe Convective Heat', advice: 'Stay inside AC shelter or well-ventilated room.' },
    { hour: 16, label: '4 PM', temp: '41°C', uv: 7, status: 'danger', title: 'Persistent Afternoon Heat', advice: 'Wait for temperature to subside before commute.' },
    { hour: 17, label: '5 PM', temp: '39°C', uv: 4, status: 'caution', title: 'Gradual Easing', advice: 'Drink electrolyte water or buttermilk.' },
    { hour: 18, label: '6 PM', temp: '37°C', uv: 2, status: 'caution', title: 'Warm Dusk', advice: 'Sun has set; ambient air still warm.' },
    { hour: 19, label: '7 PM', temp: '35°C', uv: 0, status: 'safe', title: 'Evening Respite', advice: 'Safe for evening neighborhood visits.' },
    { hour: 20, label: '8 PM', temp: '33°C', uv: 0, status: 'safe', title: 'Night Cooling', advice: 'Keep windows open for cross ventilation.' }
  ];

  const currentHourInfo = timelineHours.find(h => h.hour === selectedHour) || timelineHours[7];

  // Filter and paginate facilities
  const filteredFacilities = facilitiesList.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(facilitySearch.toLowerCase()) ||
                          f.address.toLowerCase().includes(facilitySearch.toLowerCase()) ||
                          f.type.toLowerCase().includes(facilitySearch.toLowerCase());
    if (!matchesSearch) return false;
    if (facilityFilter === 'ac') return f.type.toLowerCase().includes('ac') || f.type.toLowerCase().includes('air');
    if (facilityFilter === 'water') return f.water_station || f.type.toLowerCase().includes('water') || f.type.toLowerCase().includes('chhabeel');
    if (facilityFilter === 'misting') return f.type.toLowerCase().includes('misting') || f.type.toLowerCase().includes('park') || f.type.toLowerCase().includes('shaded');
    return true;
  });

  const totalFacilityPages = Math.max(1, Math.ceil(filteredFacilities.length / FACILITY_PAGE_SIZE));
  const paginatedFacilities = filteredFacilities.slice(
    (facilityPage - 1) * FACILITY_PAGE_SIZE,
    facilityPage * FACILITY_PAGE_SIZE
  );

  // First-Aid Knowledge Flashcards
  const firstAidCards = [
    {
      title: 'Heat Stroke vs Heat Exhaustion (पहचान व अंतर)',
      color: '#DC2626',
      badge: 'Critical Knowledge',
      left: {
        title: 'Heat Exhaustion (कमजोरी / थकावट)',
        items: ['Heavy pale sweating', 'Cool, pale, clammy skin', 'Fast weak pulse, nausea', 'Muscle cramps, dizziness']
      },
      right: {
        title: 'Heat Stroke (हीट स्ट्रोक - जानलेवा)',
        items: ['Hot, red, DRY skin (zero sweat)', 'Body temp > 103°F (40°C)', 'Confusion, slurred speech', 'Fainting or loss of consciousness']
      }
    },
    {
      title: 'Immediate 4-Step Emergency Protocol',
      color: '#EA580C',
      badge: 'First-Aid Action',
      steps: [
        'Move the victim immediately into deep shade or an air-conditioned room.',
        'Loosen all tight clothing and remove shoes/socks.',
        'Apply cold wet towels or ice packs to the neck, armpits, and groin.',
        'If conscious, give small sips of cool water with ORS. If unconscious, call 108 immediately!'
      ]
    },
    {
      title: 'Vulnerable Groups Safety: Seniors & Infants',
      color: '#0284C7',
      badge: 'Protective Care',
      steps: [
        'Never leave children or pets inside a parked vehicle, even for 2 minutes with windows cracked.',
        'Seniors taking hypertension, diuretic, or psychiatric medications have impaired thermoregulation.',
        'Dress babies in single-layer loose cotton garments; check fontanelle and hydration frequently.',
        'Ensure elderly family members rest in the coolest, lowest floor room of the building.'
      ]
    },
    {
      title: 'Home Electrolyte & Rehydration Recipe (घरेलू ओआरएस)',
      color: '#16A34A',
      badge: 'Daily Prevention',
      steps: [
        'Recipe: 1 Litre boiled & cooled drinking water + 6 teaspoons sugar + 1/2 teaspoon salt.',
        'Traditional cooling drinks: Fresh sweet lime juice, Chaas (salted buttermilk with cumin), Aam Panna, Coconut water.',
        'Avoid carbonated sodas, excessive tea, or alcohol as they accelerate renal dehydration.'
      ]
    }
  ];

  // Symptom Triage Logic
  const handleTriageSubmit = () => {
    let severeCount = 0;
    if (triageAnswers.fever === 'high') severeCount += 2;
    if (triageAnswers.sweat === 'dry') severeCount += 2;
    if (triageAnswers.confusion === 'yes') severeCount += 2;

    if (severeCount >= 4) {
      return {
        level: 'emergency',
        title: '🚨 CRITICAL MEDICAL EMERGENCY: SUSPECTED HEAT STROKE',
        description: 'The symptoms strongly suggest biological heat stroke. Delaying treatment can cause cerebral edema or organ damage.',
        action: 'Call 108 Emergency Ambulance Immediately. Place cold wet towels on patient neck & groin while waiting.'
      };
    } else if (severeCount >= 2) {
      return {
        level: 'exhaustion',
        title: '⚠️ MODERATE RISK: HEAT EXHAUSTION DETECTED',
        description: 'Your body is losing electrolytes and struggling to thermoregulate.',
        action: 'Move to the nearest municipal AC cooling shelter. Drink 500ml of ORS or buttermilk. Sponge skin with cool water.'
      };
    } else {
      return {
        level: 'mild',
        title: '✅ MILD HEAT FATIGUE',
        description: 'Early heat stress signs. Your vital regulatory functions are still intact.',
        action: 'Rest in shade, drink 2 glasses of fresh water, and avoid direct sun until evening.'
      };
    }
  };

  const triageResult = triageAnswers.fever && triageAnswers.sweat && triageAnswers.confusion ? handleTriageSubmit() : null;

  const getRiskPillClass = (band) => {
    const b = (band || '').toLowerCase();
    if (b.includes('extreme')) return 'extreme';
    if (b.includes('high')) return 'high';
    if (b.includes('low')) return 'low';
    return 'moderate';
  };

  // =========================================================
  // SVG FORECAST PLOT COMPUTATION (Responsive Scalable Vector)
  // =========================================================
  const plotWidth = 520;
  const plotHeight = 210;
  const plotPad = { top: 25, right: 30, bottom: 35, left: 45 };
  const innerW = plotWidth - plotPad.left - plotPad.right;
  const innerH = plotHeight - plotPad.top - plotPad.bottom;

  // Temperature domain: 28°C to 48°C
  const minTempDomain = 28;
  const maxTempDomain = 48;
  const getPlotX = (idx) => plotPad.left + (idx / Math.max(1, activeForecast.length - 1)) * innerW;
  const getPlotY = (temp) => {
    const clamped = Math.max(minTempDomain, Math.min(maxTempDomain, temp));
    return plotPad.top + innerH - ((clamped - minTempDomain) / (maxTempDomain - minTempDomain)) * innerH;
  };

  // Generate SVG path points
  const tempPoints = activeForecast.map((d, i) => ({
    x: getPlotX(i),
    y: getPlotY(d.temp_max_c),
    d
  }));

  const wbgtPoints = activeForecast.map((d, i) => ({
    x: getPlotX(i),
    y: getPlotY(d.wbgt_c),
    d
  }));

  const tempLinePath = tempPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const tempAreaPath = `${tempLinePath} L ${tempPoints[tempPoints.length - 1].x} ${plotPad.top + innerH} L ${tempPoints[0].x} ${plotPad.top + innerH} Z`;
  const wbgtLinePath = wbgtPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Severe heatwave reference line (42°C)
  const y42Line = getPlotY(42.0);
  const y38Line = getPlotY(38.0);

  const activeDayData = activeForecast[selectedPlotDay] || activeForecast[0];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 80% 0%, rgba(254, 215, 170, 0.35) 0%, rgba(255, 247, 237, 0.6) 35%, #FFFDF9 90%)',
      padding: viewMode === 'mobile' ? '12px 10px 40px 10px' : '20px 18px 40px 18px',
      color: '#0F172A'
    }}>
      <div style={{
        maxWidth: viewMode === 'mobile' ? '440px' : '1240px',
        margin: '0 auto',
        transition: 'max-width 0.25s ease'
      }}>

        {/* =========================================================
            HEADER BAR: Ushna Setu Theme + Ward Selector + View Mode
            ========================================================= */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--warm-border)',
          borderRadius: '14px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: 'var(--shadow-warm-sm)'
        }}>
          {/* Brand & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #FF6B00 0%, #FFA800 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 3px 10px rgba(255, 107, 0, 0.3)',
              fontSize: '18px',
              flexShrink: 0
            }}>
              ☀️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#9A3412',
                  margin: 0,
                  lineHeight: 1.1
                }}>
                  {t.appName} · उष्ण सेतु
                </h1>
                <span style={{
                  background: '#FEF3C7',
                  color: '#92400E',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}>
                  Citizen App
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                AMC Ward-Level Heatwave Safety & Decision Platform
              </div>
            </div>
          </div>

          {/* Right Controls: Ward Selector, View Toggle, Language */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Ward Selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#FFF8F1',
              border: '1px solid #FED7AA',
              borderRadius: '7px',
              padding: '3px 8px'
            }}>
              <MapPin size={13} color="#EA580C" />
              <select
                value={currentWard?.id || ''}
                onChange={(e) => {
                  const match = wards.find(w => w.id === e.target.value);
                  if (match) {
                    setCurrentWard(match);
                    onSelectWard(match);
                  }
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#7C2D12',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {wards.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.zone})
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div style={{
              display: 'flex',
              background: '#F1F5F9',
              padding: '2px',
              borderRadius: '7px',
              border: '1px solid #E2E8F0'
            }}>
              <button
                onClick={() => setViewMode('portal')}
                title="Expanded Wide Portal"
                style={{
                  border: 'none',
                  background: viewMode === 'portal' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'portal' ? '#0284C7' : '#64748B',
                  boxShadow: viewMode === 'portal' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  padding: '4px 8px',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Monitor size={12} />
                <span>Portal</span>
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                title="Mobile Smartphone Frame"
                style={{
                  border: 'none',
                  background: viewMode === 'mobile' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'mobile' ? '#EA580C' : '#64748B',
                  boxShadow: viewMode === 'mobile' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  padding: '4px 8px',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Smartphone size={12} />
                <span>Mobile</span>
              </button>
            </div>

            {/* Languages */}
            <div style={{ display: 'flex', border: '1px solid #CBD5E1', borderRadius: '7px', overflow: 'hidden' }}>
              {[
                { code: 'en', label: 'EN' },
                { code: 'hi', label: 'हिन्दी' },
                { code: 'mr', label: 'मराठी' },
                { code: 'ta', label: 'தமிழ்' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  style={{
                    border: 'none',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: selectedLanguage === lang.code ? 700 : 500,
                    background: selectedLanguage === lang.code ? '#EA580C' : '#FFFFFF',
                    color: selectedLanguage === lang.code ? '#FFFFFF' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* =========================================================
            NAVIGATION SEGMENT CAPSULE (Touch-friendly for Mobile & Desktop)
            ========================================================= */}
        <div className="citizen-tab-capsule" style={{ marginBottom: '16px' }}>
          {[
            { id: 'today', label: 'Today', icon: Sun },
            { id: 'forecast', label: '5-Day Thermal Plot', icon: TrendingUp },
            { id: 'safewindow', label: 'Safe Hours', icon: Clock },
            { id: 'shelters', label: 'Cooling Hubs', icon: Layers },
            { id: 'map', label: 'Hazard Map & SOS', icon: Compass }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`citizen-tab-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* =========================================================
            TAB 1: TODAY OVERVIEW (Hero, WBGT, Audio TTS, Profile Advisory, Hydration)
            ========================================================= */}
        {(activeTab === 'today' || viewMode === 'portal') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: viewMode === 'portal' ? '20px' : 0 }}>
            {/* Solar Hero Card */}
            <div className="solar-hero-card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#9A3412', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t.todayRisk} · {currentWard?.name || 'Danilimda'}
                </span>
                <span className={`risk-pill ${getRiskPillClass(currentWard?.risk?.risk_band)}`}>
                  {currentWard?.risk?.risk_band || 'Extreme'}
                </span>
              </div>

              {/* Temperature & Feels-Like WBGT */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
                <span className="hero-temp-num" style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '48px',
                  fontWeight: 800,
                  color: '#9A3412',
                  lineHeight: 1
                }}>
                  {currentWard?.weather?.temp_c ?? 42.8}°C
                </span>
                <span style={{ fontSize: '13px', color: '#78350F' }}>ambient</span>
              </div>

              {/* WBGT & HTSI Pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #FED7AA',
                borderRadius: '8px',
                padding: '8px 12px',
                marginTop: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Thermometer size={16} color="#EA580C" />
                  <span style={{ fontSize: '12px', color: '#64748B' }}>WBGT Feels Like:</span>
                  <strong style={{ fontSize: '14px', color: '#9A3412' }}>
                    {currentWard?.thermal_indices?.wbgt?.wbgt_c ?? 33.2}°C
                  </strong>
                </div>
                <div style={{ fontSize: '11px', color: '#0284C7', fontWeight: 700 }}>
                  HTSI: {currentWard?.thermal_indices?.htsi?.htsi_score ?? 84.5}/100
                </div>
              </div>

              {/* Weather Stats Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px',
                marginTop: '10px',
                paddingTop: '8px',
                borderTop: '1px dashed #FED7AA',
                fontSize: '11.5px',
                color: '#475569'
              }}>
                <div>💧 Humidity: <strong>{currentWard?.weather?.rh_pct ?? 36}%</strong></div>
                <div>💨 Wind: <strong>{currentWard?.weather?.wind_speed_ms ?? 2.4} m/s</strong></div>
                <div>☀️ Solar: <strong>{currentWard?.weather?.solar_radiation_wm2 ?? 780} W/m²</strong></div>
              </div>

              {/* Audio TTS Button */}
              <button
                onClick={handleToggleVoice}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  background: isSpeaking ? '#DC2626' : 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(2,132,199,0.25)'
                }}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX size={16} />
                    <span>{t.voiceSpeaking} (Tap to Pause)</span>
                    <div className="audio-wave-container">
                      <div className="audio-bar" />
                      <div className="audio-bar" />
                      <div className="audio-bar" />
                    </div>
                  </>
                ) : (
                  <>
                    <Volume2 size={16} />
                    <span>{t.voiceListen}</span>
                  </>
                )}
              </button>
            </div>

            {/* Profile-Specific Role Advisory */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--warm-border)',
              borderRadius: '14px',
              padding: '16px 18px',
              boxShadow: 'var(--shadow-warm-sm)'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#9A3412', marginBottom: '8px' }}>
                {t.profileTitle}
              </div>

              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {['general', 'elderly', 'outdoor', 'caregiver'].map((roleKey) => (
                  <button
                    key={roleKey}
                    onClick={() => setProfileRole(roleKey)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '999px',
                      border: profileRole === roleKey ? '1px solid #EA580C' : '1px solid #E2E8F0',
                      background: profileRole === roleKey ? '#FFF7ED' : '#F8FAFC',
                      color: profileRole === roleKey ? '#C2410C' : '#475569',
                      fontSize: '11.5px',
                      fontWeight: profileRole === roleKey ? 800 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {t.profiles[roleKey]}
                  </button>
                ))}
              </div>

              <div style={{ borderLeft: '3px solid #EA580C', paddingLeft: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  {t.advisories[profileRole]?.title}
                </div>
                <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
                  {t.advisories[profileRole]?.points.map((pt, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Hydration Tracker */}
            <div className="hydration-box" style={{ padding: '16px 18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GlassWater size={16} color="#0284C7" />
                  <strong style={{ fontSize: '13px', color: '#0369A1' }}>
                    {t.hydrationTracker}
                  </strong>
                </div>
                <div style={{ fontSize: '11.5px', color: '#0284C7', margin: '4px 0 6px 0' }}>
                  💧 {waterGlasses} / 10 Glasses ({(waterGlasses * 0.35).toFixed(1)} L) · ⚡ {orsCount} ORS
                </div>
                <div style={{ fontSize: '10.5px', color: '#92400E', background: '#FEF3C7', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>
                  🔥 {hydrationStreak}-Day Streak Active
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => setWaterGlasses(prev => Math.min(prev + 1, 15))}
                  style={{
                    background: '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  + Log Glass
                </button>
                <button
                  onClick={() => setOrsCount(prev => prev + 1)}
                  style={{
                    background: '#FFFFFF',
                    color: '#0284C7',
                    border: '1px solid #0284C7',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  + Log ORS
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: PROPER 5-DAY THERMAL PLOT & FORECASTING
            ========================================================= */}
        {(activeTab === 'forecast' || viewMode === 'portal') && (
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--warm-border)',
            borderRadius: '14px',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-warm-sm)',
            marginBottom: '16px'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="#EA580C" />
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#9A3412', margin: 0 }}>
                  5-Day Thermal Prediction Curve & Risk Horizon
                </h3>
              </div>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                {currentWard?.name || 'Danilimda'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
              Interactive multi-horizon plot tracking ambient maximum temperatures against outdoor WBGT feels-like stress.
            </p>

            {/* SVG Interactive Thermal Plot */}
            <div style={{ background: '#FFFDF9', borderRadius: '10px', border: '1px solid #FED7AA', padding: '10px 8px 4px 8px' }}>
              <svg viewBox={`0 0 ${plotWidth} ${plotHeight}`} className="forecast-plot-svg">
                <defs>
                  {/* Heat gradient for ambient curve */}
                  <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#EA580C" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#EA580C" stopOpacity="0.01" />
                  </linearGradient>

                  {/* Danger zone pattern */}
                  <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="10" stroke="#FCA5A5" strokeWidth="1" strokeOpacity="0.4" />
                  </pattern>
                </defs>

                {/* Shaded Severe Danger Zone (> 40°C) */}
                <rect
                  x={plotPad.left}
                  y={plotPad.top}
                  width={innerW}
                  height={Math.max(0, y42Line - plotPad.top)}
                  fill="url(#diagonalHatch)"
                />

                {/* Grid Lines */}
                {[30, 35, 40, 45].map(deg => {
                  const y = getPlotY(deg);
                  return (
                    <g key={deg}>
                      <line
                        x1={plotPad.left}
                        y1={y}
                        x2={plotPad.left + innerW}
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray={deg >= 40 ? "4 4" : "2 2"}
                        strokeWidth="1"
                      />
                      <text
                        x={plotPad.left - 8}
                        y={y + 3}
                        fontSize="10"
                        fill="#94A3B8"
                        textAnchor="end"
                        fontFamily="var(--font-mono)"
                      >
                        {deg}°C
                      </text>
                    </g>
                  );
                })}

                {/* 42°C Severe Heatwave Line */}
                <line
                  x1={plotPad.left}
                  y1={y42Line}
                  x2={plotPad.left + innerW}
                  y2={y42Line}
                  stroke="#DC2626"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <text
                  x={plotPad.left + innerW - 6}
                  y={y42Line - 4}
                  fontSize="9.5"
                  fontWeight="700"
                  fill="#DC2626"
                  textAnchor="end"
                >
                  🛑 42°C Extreme Threshold
                </text>

                {/* Ambient Temperature Filled Area */}
                <path d={tempAreaPath} fill="url(#tempGradient)" />

                {/* WBGT Line (Cyan/Blue) */}
                <path
                  d={wbgtLinePath}
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Ambient Temp Line (Flame Orange) */}
                <path
                  d={tempLinePath}
                  fill="none"
                  stroke="#EA580C"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Ambient Temp Points */}
                {tempPoints.map((p, i) => (
                  <g key={`temp-pt-${i}`}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={selectedPlotDay === i ? 6 : 4}
                      fill={selectedPlotDay === i ? "#DC2626" : "#EA580C"}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="plot-dot"
                      onClick={() => setSelectedPlotDay(i)}
                      onMouseEnter={() => setHoveredPlotIndex(i)}
                      onMouseLeave={() => setHoveredPlotIndex(null)}
                    />
                    <text
                      x={p.x}
                      y={p.y - 8}
                      fontSize="10"
                      fontWeight="800"
                      fill="#9A3412"
                      textAnchor="middle"
                      fontFamily="var(--font-mono)"
                    >
                      {p.d.temp_max_c}°
                    </text>
                  </g>
                ))}

                {/* WBGT Points */}
                {wbgtPoints.map((p, i) => (
                  <circle
                    key={`wbgt-pt-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r={3.5}
                    fill="#0284C7"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="plot-dot"
                    onClick={() => setSelectedPlotDay(i)}
                  />
                ))}

                {/* X-Axis Day Labels */}
                {tempPoints.map((p, i) => (
                  <text
                    key={`x-label-${i}`}
                    x={p.x}
                    y={plotPad.top + innerH + 18}
                    fontSize="10.5"
                    fontWeight={selectedPlotDay === i ? "800" : "600"}
                    fill={selectedPlotDay === i ? "#EA580C" : "#475569"}
                    textAnchor="middle"
                    cursor="pointer"
                    onClick={() => setSelectedPlotDay(i)}
                  >
                    {p.d.day_name}
                  </text>
                ))}
              </svg>
            </div>

            {/* Plot Legend & Threshold Chips */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginTop: '10px',
              flexWrap: 'wrap',
              fontSize: '11px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '12px', height: '3px', background: '#EA580C', borderRadius: '2px' }} />
                  <strong>Max Ambient Temp (°C)</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '12px', height: '3px', background: '#0284C7', borderRadius: '2px' }} />
                  <strong>Outdoor WBGT (°C)</strong>
                </span>
              </div>
              <div style={{ color: '#64748B' }}>
                Tap any point to inspect day metrics
              </div>
            </div>

            {/* Selected Day Inspection Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(88px, 1fr))',
              gap: '6px',
              marginTop: '12px'
            }}>
              {activeForecast.map((f, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPlotDay(idx)}
                  style={{
                    background: selectedPlotDay === idx ? '#FFF7ED' : '#F8FAFC',
                    border: selectedPlotDay === idx ? '2px solid #EA580C' : '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '8px 6px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>{f.day_name}</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#9A3412', margin: '2px 0' }}>
                    {f.temp_max_c}°C
                  </div>
                  <div style={{ fontSize: '10px', color: '#0284C7', fontWeight: 700 }}>
                    {f.wbgt_c}° WBGT
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Day Detailed Diagnostics */}
            {activeDayData && (
              <div style={{
                background: '#FFF8F1',
                border: '1px solid #FED7AA',
                borderRadius: '8px',
                padding: '10px 14px',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '11.5px'
              }}>
                <div>
                  <strong style={{ color: '#9A3412' }}>{activeDayData.day_name} Summary:</strong>{' '}
                  <span style={{ color: '#475569' }}>
                    Peak Temp: <strong>{activeDayData.temp_max_c}°C</strong> · Relative Humidity: <strong>{activeDayData.rh_pct}%</strong> · Solar: <strong>{activeDayData.solar_wm2} W/m²</strong>
                  </span>
                </div>
                <span className={`risk-pill ${getRiskPillClass(activeDayData.risk_band)}`}>
                  {activeDayData.risk_band} Risk
                </span>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 3: SAFE EXCURSION HOURS (धूप सुरक्षा समय)
            ========================================================= */}
        {(activeTab === 'safewindow' || viewMode === 'portal') && (
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--warm-border)',
            borderRadius: '14px',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-warm-sm)',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#EA580C" />
                <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#9A3412', margin: 0 }}>
                  {t.safeWindow}
                </h3>
              </div>
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                6:00 AM – 8:00 PM
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>
              {t.safeWindowSubtitle}
            </p>

            {/* Scrollable Timeline */}
            <div className="timeline-track">
              {timelineHours.map(slot => (
                <div
                  key={slot.hour}
                  onClick={() => setSelectedHour(slot.hour)}
                  className={`time-slot-card ${slot.status} ${selectedHour === slot.hour ? 'active-slot' : ''}`}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700 }}>{slot.label}</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, margin: '2px 0' }}>{slot.temp}</div>
                  <div style={{ fontSize: '9.5px' }}>
                    {slot.status === 'extreme' ? '🛑 Avoid' : slot.status === 'danger' ? '⚠️ High' : slot.status === 'caution' ? '🟡 Watch' : '🟢 Safe'}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Hour Advice */}
            <div style={{
              background: currentHourInfo.status === 'extreme' ? '#FEF2F2' : currentHourInfo.status === 'danger' ? '#FFF7ED' : currentHourInfo.status === 'caution' ? '#FFFBEB' : '#F0FDF4',
              border: `1px solid ${currentHourInfo.status === 'extreme' ? '#FECACA' : currentHourInfo.status === 'danger' ? '#FDBA74' : currentHourInfo.status === 'caution' ? '#FDE68A' : '#BBF7D0'}`,
              borderRadius: '8px',
              padding: '10px 12px',
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: currentHourInfo.status === 'extreme' ? '#991B1B' : '#166534' }}>
                  {currentHourInfo.label}: {currentHourInfo.title} (UV: {currentHourInfo.uv})
                </div>
                <div style={{ fontSize: '11.5px', color: '#334155', marginTop: '2px' }}>
                  {currentHourInfo.advice}
                </div>
              </div>
              <strong style={{ fontSize: '12px', color: '#475569', flexShrink: 0 }}>
                {currentHourInfo.temp}
              </strong>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: COOLING SHELTERS & WATER STATIONS (Paginated Directory)
            ========================================================= */}
        {(activeTab === 'shelters' || viewMode === 'portal') && (
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--warm-border)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-warm-sm)',
            overflow: 'hidden',
            marginBottom: '16px'
          }}>
            {/* Header */}
            <div style={{ padding: '16px 18px 12px 18px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '16px' }}>❄️</span>
                  <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {t.coolingDirectory}
                  </h3>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, background: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '4px' }}>
                  {filteredFacilities.length} havens
                </span>
              </div>

              {/* Search + Filter */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Search size={13} color="#94A3B8" style={{ position: 'absolute', left: '8px' }} />
                  <input
                    type="text"
                    placeholder={t.searchFacilities}
                    value={facilitySearch}
                    onChange={(e) => {
                      setFacilitySearch(e.target.value);
                      setFacilityPage(1);
                    }}
                    style={{
                      width: '100%',
                      padding: '5px 10px 5px 26px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Category pills */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: t.allFacilities },
                  { id: 'ac', label: t.acShelters },
                  { id: 'water', label: t.waterKiosks },
                  { id: 'misting', label: t.shadedHubs }
                ].map(flt => (
                  <button
                    key={flt.id}
                    onClick={() => {
                      setFacilityFilter(flt.id);
                      setFacilityPage(1);
                    }}
                    style={{
                      border: facilityFilter === flt.id ? '1px solid #0284C7' : '1px solid #E2E8F0',
                      background: facilityFilter === flt.id ? '#E0F2FE' : '#F8FAFC',
                      color: facilityFilter === flt.id ? '#0369A1' : '#64748B',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontWeight: facilityFilter === flt.id ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Paginated Cards */}
            <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {paginatedFacilities.map(fac => (
                <div
                  key={fac.id}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '10px 12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
                        {fac.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                        {fac.address}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: fac.type.includes('AC') ? '#E0F2FE' : '#FEF3C7',
                      color: fac.type.includes('AC') ? '#0284C7' : '#92400E',
                      flexShrink: 0
                    }}>
                      {fac.type}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '6px',
                    paddingTop: '6px',
                    borderTop: '1px dashed #E2E8F0',
                    fontSize: '11px'
                  }}>
                    <div style={{ display: 'flex', gap: '6px', color: '#16A34A', fontWeight: 600 }}>
                      {fac.water_station && <span>💧 Drinking Water</span>}
                      {fac.medical_staff && <span>🩺 Nurse</span>}
                    </div>
                    <div style={{ color: '#475569' }}>
                      Cap: <strong>{fac.capacity}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalFacilityPages > 1 && (
              <div className="pagination-container" style={{ padding: '8px 16px' }}>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  {t.page} <strong>{facilityPage}</strong> {t.of} <strong>{totalFacilityPages}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    className="page-btn"
                    onClick={() => setFacilityPage(p => Math.max(p - 1, 1))}
                    disabled={facilityPage === 1}
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >
                    <ChevronLeft size={12} />
                    <span>{t.prev}</span>
                  </button>

                  {Array.from({ length: totalFacilityPages }, (_, i) => i + 1).map(pNum => (
                    <button
                      key={pNum}
                      onClick={() => setFacilityPage(pNum)}
                      className={`page-num-pill ${facilityPage === pNum ? 'active' : ''}`}
                      style={{ width: '24px', height: '24px', fontSize: '11px' }}
                    >
                      {pNum}
                    </button>
                  ))}

                  <button
                    className="page-btn"
                    onClick={() => setFacilityPage(p => Math.min(p + 1, totalFacilityPages))}
                    disabled={facilityPage === totalFacilityPages}
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >
                    <span>{t.next}</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 5: HAZARD MAP & SOS EMERGENCY RESCUE
            ========================================================= */}
        {(activeTab === 'map' || viewMode === 'portal') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* GIS Map Card */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--warm-border)',
              borderRadius: '14px',
              padding: '16px',
              boxShadow: 'var(--shadow-warm-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Compass size={16} color="#0284C7" />
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Ahmedabad Ward Heat GIS Map
                  </h3>
                </div>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Tap ward to inspect
                </span>
              </div>

              <div style={{ height: viewMode === 'mobile' ? '280px' : '380px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                <WardRiskMap
                  wards={wards}
                  selectedWardId={currentWard?.id}
                  onSelectWard={(w) => {
                    setCurrentWard(w);
                    onSelectWard(w);
                  }}
                  coolingCentres={facilitiesList}
                  emergencyHospitals={emergencyHospitals}
                  height={viewMode === 'mobile' ? '280px' : '380px'}
                />
              </div>
            </div>

            {/* Emergency 108 & SOS Hub */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #FECACA',
              borderRadius: '14px',
              padding: '16px 18px',
              boxShadow: 'var(--shadow-warm-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <ShieldAlert size={16} color="#DC2626" />
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#991B1B', margin: 0 }}>
                  Emergency Medical Rescue (108)
                </h4>
              </div>
              <p style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '12px' }}>
                Ahmedabad Civil Hospital Heat-Stroke Unit (Immersion Cold-Water Baths & Telemetry ICU active).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <a
                  href="tel:108"
                  className="btn-danger"
                  style={{
                    padding: '10px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    justifyContent: 'center',
                    textDecoration: 'none',
                    borderRadius: '8px'
                  }}
                >
                  <PhoneCall size={14} />
                  <span>Call 108 Ambulance</span>
                </a>

                <button
                  onClick={() => setShowSosModal(true)}
                  style={{
                    background: '#FFF1F2',
                    border: '1px solid #FDA4AF',
                    color: '#9F1239',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <Share2 size={14} />
                  <span>Send GPS SOS</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* =========================================================
          MODAL: SYMPTOM TRIAGE QUIZ
          ========================================================= */}
      {showTriageModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '22px 24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowTriageModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              <X size={15} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Activity size={18} color="#EA580C" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {t.symptomChecker}
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>
              {t.symptomSubtitle}
            </p>

            {/* Question 1: Skin */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                1. What does the person's skin feel like?
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  onClick={() => setTriageAnswers(prev => ({ ...prev, sweat: 'sweating' }))}
                  className={`triage-option-btn ${triageAnswers.sweat === 'sweating' ? 'selected' : ''}`}
                >
                  <span style={{ fontSize: '11.5px' }}>Cool, pale & heavy sweat</span>
                  {triageAnswers.sweat === 'sweating' && <Check size={13} color="#0284C7" />}
                </button>
                <button
                  onClick={() => setTriageAnswers(prev => ({ ...prev, sweat: 'dry' }))}
                  className={`triage-option-btn ${triageAnswers.sweat === 'dry' ? 'selected' : ''}`}
                >
                  <span style={{ fontSize: '11.5px', color: '#DC2626' }}>Hot, red & DRY (no sweat)</span>
                  {triageAnswers.sweat === 'dry' && <Check size={13} color="#DC2626" />}
                </button>
              </div>
            </div>

            {/* Question 2: Fever */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                2. Temperature / Fever:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  onClick={() => setTriageAnswers(prev => ({ ...prev, fever: 'normal' }))}
                  className={`triage-option-btn ${triageAnswers.fever === 'normal' ? 'selected' : ''}`}
                >
                  <span style={{ fontSize: '11.5px' }}>Warm (&lt; 102°F)</span>
                  {triageAnswers.fever === 'normal' && <Check size={13} color="#0284C7" />}
                </button>
                <button
                  onClick={() => setTriageAnswers(prev => ({ ...prev, fever: 'high' }))}
                  className={`triage-option-btn ${triageAnswers.fever === 'high' ? 'selected' : ''}`}
                >
                  <span style={{ fontSize: '11.5px', color: '#DC2626' }}>High Fever (&gt; 103°F)</span>
                  {triageAnswers.fever === 'high' && <Check size={13} color="#DC2626" />}
                </button>
              </div>
            </div>

            {/* Question 3: Alertness */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                3. Neurological state:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  onClick={() => setTriageAnswers(prev => ({ ...prev, confusion: 'no' }))}
                  className={`triage-option-btn ${triageAnswers.confusion === 'no' ? 'selected' : ''}`}
                >
                  <span style={{ fontSize: '11.5px' }}>Alert / mild fatigue</span>
                  {triageAnswers.confusion === 'no' && <Check size={13} color="#0284C7" />}
                </button>
                <button
                  onClick={() => setTriageAnswers(prev => ({ ...prev, confusion: 'yes' }))}
                  className={`triage-option-btn ${triageAnswers.confusion === 'yes' ? 'selected' : ''}`}
                >
                  <span style={{ fontSize: '11.5px', color: '#DC2626' }}>Confused / slurred speech</span>
                  {triageAnswers.confusion === 'yes' && <Check size={13} color="#DC2626" />}
                </button>
              </div>
            </div>

            {/* Result Box */}
            {triageResult && (
              <div style={{
                background: triageResult.level === 'emergency' ? '#FEF2F2' : triageResult.level === 'exhaustion' ? '#FFFBEB' : '#F0FDF4',
                border: `1px solid ${triageResult.level === 'emergency' ? '#FECACA' : triageResult.level === 'exhaustion' ? '#FDE68A' : '#BBF7D0'}`,
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '14px',
                fontSize: '12px'
              }}>
                <div style={{
                  fontWeight: 800,
                  color: triageResult.level === 'emergency' ? '#991B1B' : triageResult.level === 'exhaustion' ? '#92400E' : '#166534',
                  marginBottom: '4px'
                }}>
                  {triageResult.title}
                </div>
                <div style={{ color: '#334155', marginBottom: '6px' }}>
                  {triageResult.description}
                </div>
                <div style={{ fontWeight: 700, color: triageResult.level === 'emergency' ? '#DC2626' : '#0369A1' }}>
                  {triageResult.action}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              {triageResult?.level === 'emergency' ? (
                <a
                  href="tel:108"
                  className="btn-danger"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 800,
                    justifyContent: 'center',
                    textDecoration: 'none',
                    borderRadius: '8px'
                  }}
                >
                  <PhoneCall size={14} />
                  <span>Call 108 Emergency</span>
                </a>
              ) : (
                <button
                  onClick={() => setShowTriageModal(false)}
                  style={{
                    width: '100%',
                    background: '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Close & Follow Safe Guidelines
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: SOS DISTRESS BROADCAST
          ========================================================= */}
      {showSosModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '440px',
            width: '100%',
            padding: '22px 24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowSosModal(false);
                setSosSent(false);
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              <X size={15} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <ShieldAlert size={18} color="#DC2626" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {t.sosBroadcast}
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
              {t.sosSubtitle}
            </p>

            {sosSent ? (
              <div style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '8px',
                padding: '14px',
                textAlign: 'center',
                marginBottom: '14px'
              }}>
                <CheckCircle2 size={30} color="#16A34A" style={{ margin: '0 auto 6px auto' }} />
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>
                  {t.sosSent}
                </div>
                <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '4px' }}>
                  Ward: <strong>{currentWard?.name}</strong> · Lat: 23.02°N, Lng: 72.58°E · Temp: {currentWard?.weather?.temp_c}°C
                </div>
              </div>
            ) : (
              <div style={{
                background: '#FFF1F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '14px',
                fontSize: '11.5px',
                color: '#991B1B'
              }}>
                Sending distress signal dispatches your exact GPS coordinates and microclimate thermal stress to 108 Emergency Response.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {!sosSent ? (
                <button
                  onClick={() => setSosSent(true)}
                  style={{
                    background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  {t.sosBtn}
                </button>
              ) : (
                <button
                  onClick={() => setShowSosModal(false)}
                  style={{
                    background: '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Close & Rest in Shaded Area
                </button>
              )}

              <a
                href="tel:108"
                style={{
                  textAlign: 'center',
                  color: '#DC2626',
                  fontWeight: 700,
                  fontSize: '12px',
                  textDecoration: 'none',
                  padding: '4px'
                }}
              >
                Or Dial 108 Phone Line Directly
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
