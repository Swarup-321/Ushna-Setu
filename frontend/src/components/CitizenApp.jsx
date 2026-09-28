import React, { useState, useEffect } from 'react';
import {
  Home,
  Calendar,
  Map as MapIcon,
  PhoneCall,
  Settings,
  Volume2,
  VolumeX,
  MapPin,
  ShieldAlert,
  Thermometer,
  Wind,
  Droplets,
  ExternalLink,
  ChevronRight,
  LifeBuoy,
  CheckCircle,
  Building2,
  HeartPulse,
  GlassWater,
  AlertOctagon,
  Clock
} from 'lucide-react';
import WardRiskMap from './WardRiskMap';
import { TRANSLATIONS } from '../translations';

export default function CitizenApp({
  wards = [],
  selectedWard = null,
  onSelectWard = () => {},
  coolingCentres = [],
  emergencyHospitals = [],
  latestAlert = null,
  isDualView = false
}) {
  const [activeTab, setActiveTab] = useState('home'); // home, forecast, map, emergency, settings
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // en, hi, mr, ta
  const [profileRole, setProfileRole] = useState('general'); // general, elderly, outdoor, caregiver
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWard, setCurrentWard] = useState(selectedWard || (wards.length > 0 ? wards[0] : null));

  // Hydration reminder timer
  const [waterGlasses, setWaterGlasses] = useState(4);
  const [hydrationStreak, setHydrationStreak] = useState(3);

  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  useEffect(() => {
    if (selectedWard) {
      setCurrentWard(selectedWard);
    } else if (wards.length > 0 && !currentWard) {
      setCurrentWard(wards[0]);
    }
  }, [selectedWard, wards]);

  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const currentAdvisory = t.advisories[profileRole];
    const riskBandText = currentWard?.risk?.risk_band || 'Moderate';
    const tempText = currentWard?.weather?.temp_c || '41';
    const wbgtText = currentWard?.thermal_indices?.wbgt?.wbgt_c || '32';

    let speechText = "";
    if (selectedLanguage === 'hi') {
      speechText = `उष्ण सेतु चेतावनी। आज ${currentWard?.name || 'अहमदाबाद'} में तापमान ${tempText} डिग्री सेल्सियस है और ऊष्मीय तनाव ${riskBandText} श्रेणी में है। ${currentAdvisory.title}। ${currentAdvisory.points.join('. ')}। आपातकाल के लिए 108 डायल करें।`;
    } else if (selectedLanguage === 'mr') {
      speechText = `उष्ण सेतू पूर्वसूचना। आज ${currentWard?.name || 'अहमदाबाद'} मध्ये तापमान ${tempText} अंश आहे. ${currentAdvisory.title}। ${currentAdvisory.points.join('. ')}। मदतीसाठी १०८ वर संपर्क करा.`;
    } else if (selectedLanguage === 'ta') {
      speechText = `உஷ்ண சேது எச்சரிக்கை. இன்று ${currentWard?.name || 'அகமதாபாத்'} நகரில் வெப்பநிலை ${tempText} டிகிரி. ${currentAdvisory.title}. ${currentAdvisory.points.join('. ')}. அவசர உதவிக்கு 108 அழைக்கவும்.`;
    } else {
      speechText = `Ushna Setu Warning. Today in ${currentWard?.name || 'Ahmedabad'}, the temperature is ${tempText} degrees Celsius, with outdoor WBGT at ${wbgtText} degrees. Thermal risk is ${riskBandText}. ${currentAdvisory.title}. ${currentAdvisory.points.join('. ')}. For medical emergency, call 108 immediately.`;
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

  const getRiskBadgeCls = (band) => {
    const b = (band || '').toLowerCase();
    if (b.includes('extreme')) return 'extreme';
    if (b.includes('high')) return 'high';
    if (b.includes('low')) return 'low';
    return 'moderate';
  };

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0B101D', color: '#F8FAFC' }}>
      {/* Mobile Top Header */}
      <header style={{
        background: 'rgba(11, 16, 29, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #FF3B30, #FF9500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            fontSize: '13px',
            boxShadow: '0 0 10px rgba(255,59,48,0.5)'
          }}>
            ☀️
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: '#FFF' }}>
              {t.appName}
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8' }}>{t.tagline}</div>
          </div>
        </div>

        {/* Location Chip */}
        <div
          onClick={() => setActiveTab('map')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '12px',
            cursor: 'pointer',
            color: '#00F2FE'
          }}
        >
          <MapPin size={12} color="#00F2FE" />
          <span>{currentWard?.name || 'Danilimda'}</span>
        </div>
      </header>

      {/* Incoming Live Emergency Alert Banner (Syncs with Authority Broadcasts!) */}
      {latestAlert && (
        <div style={{
          background: 'linear-gradient(90deg, #991B1B, #B91C1C)',
          color: '#FFF',
          padding: '10px 16px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'pulse-border 2s infinite'
        }}>
          <AlertOctagon size={16} color="#FEF08A" />
          <div style={{ flex: 1, fontSize: '11.5px', lineHeight: 1.3 }}>
            <strong>AMC Emergency Broadcast:</strong> {latestAlert.message_preview || 'Severe heat emergency active.'}
          </div>
        </div>
      )}

      {/* Main Scroll Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 84px 18px' }}>
        {/* =========================================================
            SCREEN 1: TODAY (HOME)
            ========================================================= */}
        {activeTab === 'home' && (
          <div>
            {/* Glowing Hero Card */}
            <div style={{
              background: 'rgba(22, 32, 53, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              padding: '22px 20px',
              marginBottom: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
                  {t.todayRisk}
                </span>
                <span className={`badge-luminous ${getRiskBadgeCls(currentWard?.risk?.risk_band)}`}>
                  {currentWard?.risk?.risk_band || 'Extreme'}
                </span>
              </div>

              {/* Fraunces Big Display */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '6px 0 2px 0' }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '52px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  textShadow: '0 0 24px rgba(255, 255, 255, 0.2)'
                }}>
                  {currentWard?.weather?.temp_c ?? '42.8'}°C
                </span>
                <span style={{ fontSize: '14px', color: '#94A3B8' }}>dry bulb</span>
              </div>

              {/* WBGT "Feels Like" in Cool Cyan */}
              <div style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#00F2FE',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '4px',
                textShadow: '0 0 12px rgba(0, 242, 254, 0.4)'
              }}>
                <span>{t.feelsLikeWbgt}:</span>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: '18px' }}>
                  {currentWard?.thermal_indices?.wbgt?.wbgt_c ?? '33.2'}°C WBGT
                </strong>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                fontSize: '12px',
                color: '#94A3B8'
              }}>
                <span>RH: <strong style={{ color: '#FFF' }}>{currentWard?.weather?.rh_pct ?? 36}%</strong></span>
                <span>Wind: <strong style={{ color: '#FFF' }}>{currentWard?.weather?.wind_speed_ms ?? 2.4} m/s</strong></span>
                <span>Solar: <strong style={{ color: '#FFF' }}>{currentWard?.weather?.solar_radiation_wm2 ?? 780} W/m²</strong></span>
              </div>
            </div>

            {/* Voice Reader Button with Animated Audio Waveform */}
            <button
              onClick={handleToggleVoice}
              style={{
                width: '100%',
                background: isSpeaking ? 'linear-gradient(135deg, #FF3B30, #FF9500)' : 'linear-gradient(135deg, #00F2FE, #4FACFE)',
                color: isSpeaking ? '#FFF' : '#070A12',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '13.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                marginBottom: '16px',
                boxShadow: isSpeaking ? '0 0 20px rgba(255,59,48,0.5)' : '0 0 20px rgba(0,242,254,0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              {isSpeaking ? (
                <>
                  <div className="audio-waveform-bar">
                    <div className="wave-bar" style={{ animationDelay: '0.1s', background: '#FFF' }} />
                    <div className="wave-bar" style={{ animationDelay: '0.3s', background: '#FFF' }} />
                    <div className="wave-bar" style={{ animationDelay: '0.2s', background: '#FFF' }} />
                    <div className="wave-bar" style={{ animationDelay: '0.4s', background: '#FFF' }} />
                  </div>
                  <span>{t.voiceSpeaking} (Tap to Stop)</span>
                </>
              ) : (
                <>
                  <Volume2 size={18} />
                  <span>{t.voiceListen}</span>
                </>
              )}
            </button>

            {/* Hydration Tracker Widget */}
            <div style={{
              background: 'rgba(22, 32, 53, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GlassWater size={18} color="#00F2FE" />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>Hydration Safety Count</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Goal: 8-10 glasses with ORS in heatwave</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#00F2FE' }}>{waterGlasses} / 10</span>
                <button
                  onClick={() => setWaterGlasses(prev => Math.min(prev + 1, 15))}
                  style={{
                    background: 'rgba(0, 242, 254, 0.2)',
                    border: '1px solid #00F2FE',
                    color: '#00F2FE',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Profile Selector */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, marginBottom: '6px' }}>
                {t.profileTitle}
              </div>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px' }}>
                {['general', 'elderly', 'outdoor', 'caregiver'].map((roleKey) => (
                  <button
                    key={roleKey}
                    onClick={() => setProfileRole(roleKey)}
                    style={{
                      background: profileRole === roleKey ? 'var(--brand-gradient)' : 'rgba(255, 255, 255, 0.05)',
                      color: profileRole === roleKey ? '#070A12' : '#CBD5E1',
                      border: profileRole === roleKey ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '999px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: profileRole === roleKey ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: profileRole === roleKey ? '0 0 12px rgba(0,242,254,0.4)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {t.profiles[roleKey]}
                  </button>
                ))}
              </div>
            </div>

            {/* Plain Action Advisory Card */}
            <div style={{
              background: 'rgba(22, 32, 53, 0.6)',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderLeft: '4px solid #00F2FE',
              marginBottom: '16px'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>
                {t.advisories[profileRole]?.title}
              </h4>
              <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '12.5px', color: '#CBD5E1', lineHeight: 1.55 }}>
                {t.advisories[profileRole]?.points.map((pt, i) => (
                  <li key={i} style={{ marginBottom: '6px' }}>{pt}</li>
                ))}
              </ul>
            </div>

            {/* 5-Day Outlook Horizontal Strip */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>{t.tabs.forecast}</span>
                <span onClick={() => setActiveTab('forecast')} style={{ fontSize: '11.5px', color: '#00F2FE', cursor: 'pointer' }}>
                  View all ▸
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                {[
                  { day: 'Today', temp: 42.8, wbgt: 33.2, band: 'Extreme' },
                  { day: 'Tue', temp: 43.5, wbgt: 33.8, band: 'Extreme' },
                  { day: 'Wed', temp: 44.1, wbgt: 34.2, band: 'Extreme' },
                  { day: 'Thu', temp: 43.0, wbgt: 33.5, band: 'High' },
                  { day: 'Fri', temp: 41.2, wbgt: 32.0, band: 'High' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: idx === 0 ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                    border: idx === 0 ? '1px solid #00F2FE' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    minWidth: '80px',
                    textAlign: 'center',
                    flexShrink: 0
                  }}>
                    <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>{item.day}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, margin: '2px 0' }}>{item.temp}°</div>
                    <div style={{ fontSize: '10px', color: '#00F2FE', marginBottom: '4px' }}>{item.wbgt}° WBGT</div>
                    <span className={`badge-luminous ${getRiskBadgeCls(item.band)}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                      {item.band}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearest Cooling Shelter Tile */}
            <div style={{
              background: 'rgba(52, 199, 89, 0.1)',
              border: '1px solid rgba(52, 199, 89, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px' }}>❄</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#8CE097' }}>
                    Nearest AC Cooling Shelter Open
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                    Danilimda AMC AC Hall · Free water & ORS
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('emergency')}
                className="btn-glow-primary"
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                Locate
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            SCREEN 2: 5-DAY OUTLOOK
            ========================================================= */}
        {activeTab === 'forecast' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', marginBottom: '4px' }}>
              5-Day Thermal Risk Outlook
            </h3>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '16px' }}>
              Machine learning forecasted thermal strain for {currentWard?.name || 'Ahmedabad'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { day: 'Today', date: '28 Sep', max: 42.8, wbgt: 33.2, band: 'Extreme', advisory: 'Severe heatwave. Avoid direct sunlight 11am-4pm.' },
                { day: 'Tomorrow', date: '29 Sep', max: 43.5, wbgt: 33.8, band: 'Extreme', advisory: 'Peak heat. Cooling shelters operational.' },
                { day: 'Wednesday', date: '30 Sep', max: 44.1, wbgt: 34.2, band: 'Extreme', advisory: 'Outdoor work stoppage recommended.' },
                { day: 'Thursday', date: '01 Oct', max: 43.0, wbgt: 33.5, band: 'High', advisory: 'High thermal burden. Drink ORS frequently.' },
                { day: 'Friday', date: '02 Oct', max: 41.2, wbgt: 32.0, band: 'High', advisory: 'Marginal relief expected from evening breeze.' }
              ].map((item, i) => (
                <div key={i} style={{
                  background: 'rgba(22, 32, 53, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <strong style={{ fontSize: '14px', color: '#FFF' }}>{item.day}</strong>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>{item.date}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#00F2FE', marginTop: '2px' }}>
                      WBGT: <strong>{item.wbgt}°C</strong> (Dry Bulb: {item.max}°C)
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px' }}>
                      {item.advisory}
                    </div>
                  </div>
                  <div>
                    <span className={`badge-luminous ${getRiskBadgeCls(item.band)}`}>
                      {item.band}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            SCREEN 3: WARD MAP
            ========================================================= */}
        {activeTab === 'map' && (
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', marginBottom: '2px' }}>
              Heat Hazard Ward Map
            </h3>
            <p style={{ fontSize: '11.5px', color: '#94A3B8', marginBottom: '12px' }}>
              Tap any ward polygon to see localized thermal stress and shelters.
            </p>

            <div style={{ height: '360px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '14px' }}>
              <WardRiskMap
                wards={wards}
                selectedWardId={currentWard?.id}
                onSelectWard={(w) => setCurrentWard(w)}
                coolingCentres={coolingCentres}
                emergencyHospitals={emergencyHospitals}
                height="360px"
                compact={true}
              />
            </div>

            {currentWard && (
              <div style={{
                background: 'rgba(22, 32, 53, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 800, fontSize: '16px', color: '#FFF' }}>
                    {currentWard.name} ({currentWard.zone})
                  </div>
                  <span className={`badge-luminous ${getRiskBadgeCls(currentWard.risk?.risk_band)}`}>
                    {currentWard.risk?.risk_band}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '10px' }}>
                  Temp: <strong style={{ color: '#FFF' }}>{currentWard.weather?.temp_c}°C</strong> · WBGT: <strong style={{ color: '#00F2FE' }}>{currentWard.thermal_indices?.wbgt?.wbgt_c}°C</strong>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setActiveTab('emergency')}
                    className="btn-glow-primary"
                    style={{ flex: 1, padding: '8px', fontSize: '11.5px', justifyContent: 'center' }}
                  >
                    View Shelters
                  </button>
                  <a
                    href="tel:108"
                    className="btn-glow-danger"
                    style={{ flex: 1, padding: '8px', fontSize: '11.5px', justifyContent: 'center', textDecoration: 'none' }}
                  >
                    Call 108
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            SCREEN 4: EMERGENCY
            ========================================================= */}
        {activeTab === 'emergency' && (
          <div>
            <a
              href="tel:108"
              className="btn-glow-danger"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 800,
                borderRadius: '14px',
                justifyContent: 'center',
                textDecoration: 'none',
                marginBottom: '18px',
                boxShadow: '0 0 30px rgba(255,59,48,0.5)'
              }}
            >
              <PhoneCall size={22} />
              <span>{t.emergencyCallBtn}</span>
            </a>

            {/* Cooling Shelters */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>
                {t.coolingCentresTitle}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {coolingCentres.slice(0, 3).map((c) => (
                  <div key={c.id} style={{
                    background: 'rgba(22, 32, 53, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '12px'
                  }}>
                    <div style={{ fontWeight: 700, color: '#00F2FE', fontSize: '13px' }}>{c.name}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0' }}>{c.address}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px' }}>
                      <span>Capacity: <strong>{c.capacity}</strong></span>
                      <span style={{ color: '#34C759', fontWeight: 700 }}>{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Designated Hospitals */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>
                {t.hospitalsTitle}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {emergencyHospitals.slice(0, 2).map((h) => (
                  <div key={h.id} style={{
                    background: 'rgba(22, 32, 53, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '12px'
                  }}>
                    <div style={{ fontWeight: 700, color: '#FF3B30', fontSize: '13px' }}>{h.name}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>{h.address}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px' }}>
                      <span>Heat Stroke Beds: <strong>{h.heat_stroke_beds}</strong></span>
                      <a href="tel:108" style={{ color: '#FF3B30', fontWeight: 800, textDecoration: 'none' }}>Dial 108</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* First Aid Steps */}
            <div style={{
              background: 'rgba(7, 10, 18, 0.6)',
              borderRadius: '12px',
              padding: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>
                {t.firstAidTitle}
              </h4>
              <ol style={{ paddingLeft: '18px', margin: 0, fontSize: '12px', color: '#CBD5E1', lineHeight: 1.5 }}>
                {t.firstAidSteps.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* =========================================================
            SCREEN 5: SETTINGS & LOCALIZATION
            ========================================================= */}
        {activeTab === 'settings' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', marginBottom: '14px' }}>
              Accessibility & Language
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              {[
                { code: 'en', label: 'English', native: 'English' },
                { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
                { code: 'mr', label: 'Marathi', native: 'मराठी' },
                { code: 'ta', label: 'Tamil', native: 'தமிழ்' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: selectedLanguage === lang.code ? '2px solid #00F2FE' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: selectedLanguage === lang.code ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#FFF' }}>{lang.native}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>{lang.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating 108 SOS Button */}
      {activeTab !== 'emergency' && (
        <a
          href="tel:108"
          style={{
            position: 'absolute',
            bottom: '78px',
            right: '18px',
            background: 'linear-gradient(135deg, #FF3B30, #FF9500)',
            color: '#FFF',
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255, 59, 48, 0.6)',
            cursor: 'pointer',
            zIndex: 999,
            textDecoration: 'none'
          }}
        >
          <PhoneCall size={22} />
        </a>
      )}

      {/* Bottom Nav */}
      <nav style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '66px',
        background: 'rgba(11, 16, 29, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px',
        zIndex: 1000
      }}>
        {[
          { id: 'home', label: t.tabs.home, icon: Home },
          { id: 'forecast', label: t.tabs.forecast, icon: Calendar },
          { id: 'map', label: t.tabs.map, icon: MapIcon },
          { id: 'emergency', label: t.tabs.emergency, icon: LifeBuoy },
          { id: 'settings', label: t.tabs.settings, icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                color: isActive ? '#00F2FE' : '#64748B',
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                flex: 1,
                height: '100%',
                justifyContent: 'center'
              }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );

  // If in Split View or Standalone Phone Frame
  if (isDualView) {
    return (
      <div className="phone-mockup-outer">
        <div className="phone-speaker-notch">
          <div className="speaker-lens" />
        </div>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 16px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="phone-mockup-outer" style={{ width: '100%', maxWidth: '440px', position: 'relative', height: '840px', top: 'auto' }}>
        <div className="phone-speaker-notch">
          <div className="speaker-lens" />
        </div>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {content}
        </div>
      </div>
    </div>
  );
}
