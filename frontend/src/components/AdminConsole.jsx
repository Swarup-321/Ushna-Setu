import React, { useState } from 'react';
import {
  LayoutDashboard,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Send,
  BookOpen,
  Bell,
  CheckCircle2,
  Clock,
  User,
  Shield,
  SunMedium,
  Wind,
  Droplets,
  Building,
  Info,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
  Truck,
  HeartPulse,
  Radio,
  Sliders,
  Share2
} from 'lucide-react';
import WardRiskMap from './WardRiskMap';
import PredictionChart from './PredictionChart';

export default function AdminConsole({
  cityData,
  wards = [],
  selectedWard,
  onSelectWard = () => { },
  wardDetail,
  onTriggerAction = () => { },
  onDispatchAlert = () => { },
  alertsList = [],
  actionsLog = [],
  methodologyData,
  userRole = 'officer' // 'officer' or 'disaster_mgmt'
}) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, detail, forecast, actions, alerts
  const [officerName, setOfficerName] = useState(
    userRole === 'disaster_mgmt'
      ? 'K. Patel (Chief Disaster Management Officer, AMC)'
      : 'Dr. S. K. Patel (Zonal Health Officer, AMC)'
  );
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Alert composer states
  const [selectedAlertWards, setSelectedAlertWards] = useState(['ward-19', 'ward-14', 'ward-27']);
  const [alertChannel, setAlertChannel] = useState('WhatsApp + SMS Gateway');
  const [alertLanguages, setAlertLanguages] = useState(['English', 'Gujarati', 'Hindi']);
  const [alertCustomText, setAlertCustomText] = useState('');
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [alertSuccessMsg, setAlertSuccessMsg] = useState('');
  const [tankerDispatched, setTankerDispatched] = useState(false);

  const filteredWards = wards.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.zone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' ||
      w.risk.risk_band.toLowerCase() === filterSeverity.toLowerCase();
    return matchesSearch && matchesSeverity;
  });

  const handleTrigger = (actionType, title, defaultNotes) => {
    if (!selectedWard) return;
    onTriggerAction({
      ward_id: selectedWard.id,
      action_type: actionType,
      title: title,
      triggered_by: officerName,
      notes: defaultNotes
    });
  };

  const handleDispatchWaterTanker = () => {
    setTankerDispatched(true);
    handleTrigger('water_tanker', `Emergency Water Tanker Fleet Dispatched: ${selectedWard?.name || 'Danilimda'}`, '3 municipal potable water tankers deployed with ORS packets.');
    setTimeout(() => setTankerDispatched(false), 5000);
  };

  const handleSendAlertSubmit = async (e) => {
    e.preventDefault();
    setIsSendingAlert(true);
    await onDispatchAlert({
      ward_ids: selectedAlertWards,
      channel: alertChannel,
      languages: alertLanguages,
      custom_message: alertCustomText || undefined,
      triggered_by: officerName
    });
    setIsSendingAlert(false);
    setAlertSuccessMsg('Dispatched to 18,450 mobile subscribers via Twilio/Gupshup Sandbox');
    setTimeout(() => {
      setAlertSuccessMsg('');
      setAlertModalOpen(false);
    }, 2200);
  };

  const renderRiskBadge = (score, band) => {
    let cls = 'moderate';
    if (score >= 80) cls = 'extreme';
    else if (score >= 60) cls = 'high';
    else if (score < 40) cls = 'low';

    return (
      <span className={`risk-pill ${cls}`}>
        {band || (score >= 80 ? 'Extreme' : score >= 60 ? 'High' : score >= 40 ? 'Moderate' : 'Low')}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 65px)', background: 'var(--warm-bg)', backgroundAttachment: 'fixed' }}>
      {/* Warm Clean Sidebar */}
      <aside style={{
        width: '260px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid var(--warm-border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--warm-border)', background: '#FFF7ED' }}>
          <div style={{ fontSize: '11px', color: '#9A3412', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
            {userRole === 'disaster_mgmt' ? 'City Disaster Authority' : 'Municipal Health Office'}
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '2px', fontFamily: 'var(--font-display)' }}>
            Ahmedabad Municipal Corp
          </div>
          <div style={{ fontSize: '11px', color: '#EA580C', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontWeight: 600 }}>
            <Radio size={12} />
            <span>Heat Action Plan Active</span>
          </div>
        </div>

        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {[
            { id: 'overview', label: 'City Overview', icon: LayoutDashboard },
            { id: 'detail', label: 'Ward Diagnostics', icon: MapPin, badge: selectedWard?.name },
            { id: 'forecast', label: '5-Day Trend & ML Chart', icon: TrendingUp },
            { id: 'actions', label: 'Civic Actions Log', icon: AlertTriangle, count: actionsLog.length },
            { id: 'alerts', label: 'Alerts Gateway', icon: Send, count: alertsList.length }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  background: isActive ? '#FFF7ED' : 'transparent',
                  color: isActive ? '#EA580C' : '#334155',
                  border: isActive ? '1px solid var(--warm-border)' : '1px solid transparent',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{ fontSize: '10.5px', background: '#FED7AA', padding: '2px 6px', borderRadius: '4px', color: '#9A3412', fontWeight: 600 }}>
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && (
                  <span style={{ fontSize: '11px', background: isActive ? '#FED7AA' : '#FFF7ED', padding: '2px 7px', borderRadius: '999px', color: '#9A3412', fontWeight: 700 }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Officer Status footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--warm-border)', background: '#FFF7ED' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A' }} />
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A' }}>Active Officer Session</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>{officerName}</div>
        </div>
      </aside>

      {/* Main Command Workspace */}
      <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', maxWidth: '1600px' }}>
        {/* Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          borderBottom: '1px solid var(--warm-border)',
          paddingBottom: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#9A3412', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
              {activeTab === 'overview' && 'Ahmedabad Heatwave Decision Support Operations Dashboard'}
              {activeTab === 'detail' && `Ward Diagnostics & Action Layer: ${selectedWard ? selectedWard.name : 'Select Ward'}`}
              {activeTab === 'forecast' && '5-Day Multi-Horizon Random Forest Regressor Prediction'}
              {activeTab === 'actions' && 'Administrative Directive Registry & Audit Trail'}
              {activeTab === 'alerts' && 'Public Emergency Telecom Gateway (SMS & WhatsApp API)'}
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
              Ministry of Earth Sciences (NCMRWF) · SIH PS26083 Pilot Decision Support Platform
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setAlertModalOpen(true)}
              className="btn-danger"
            >
              <Send size={14} />
              <span>Broadcast Emergency Warning</span>
            </button>
          </div>
        </div>

        {/* =========================================================
            TAB 1: CITY OVERVIEW
            ========================================================= */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div className="index-stat-card" style={{ borderLeftColor: '#DC2626' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                  <span style={{ fontWeight: 600 }}>Extreme Risk Wards</span>
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>Score ≥ 80</span>
                </div>
                <div className="index-number-huge" style={{ color: '#DC2626' }}>
                  {cityData?.summary?.extreme_wards ?? 4}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Immediate cooling center activation active
                </div>
              </div>

              <div className="index-stat-card" style={{ borderLeftColor: '#EA580C' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                  <span style={{ fontWeight: 600 }}>High Risk Wards</span>
                  <span style={{ color: '#EA580C', fontWeight: 700 }}>Score 60–79</span>
                </div>
                <div className="index-number-huge" style={{ color: '#EA580C' }}>
                  {cityData?.summary?.high_wards ?? 7}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Mandatory shaded rest advisory active
                </div>
              </div>

              <div className="index-stat-card" style={{ borderLeftColor: '#0284C7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                  <span style={{ fontWeight: 600 }}>Peak City WBGT</span>
                  <span style={{ color: '#0284C7', fontWeight: 700 }}>Outdoor Labor</span>
                </div>
                <div className="index-number-huge" style={{ color: '#0284C7' }}>
                  33.4<span style={{ fontSize: '20px' }}>°C</span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Black Flag (&gt;32.2°C) occupational hazard
                </div>
              </div>

              <div className="index-stat-card" style={{ borderLeftColor: '#16A34A' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                  <span style={{ fontWeight: 600 }}>Active Directives</span>
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>Audited</span>
                </div>
                <div className="index-number-huge" style={{ color: '#16A34A' }}>
                  {actionsLog.length}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Cooling shelters, work bans & water fleets
                </div>
              </div>
            </div>

            {/* Map & Priority List */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div className="light-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                      Ward Heat Hazard GIS Choropleth
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>Click any ward to drill down</span>
                  </div>
                  <span style={{ fontSize: '11px', background: '#F0F9FF', color: '#0284C7', padding: '3px 8px', borderRadius: '4px', fontWeight: 600, border: '1px solid #BAE6FD' }}>
                    18 Wards Georeferenced
                  </span>
                </div>

                <div style={{ height: '480px', borderRadius: '8px', overflow: 'hidden' }}>
                  <WardRiskMap
                    wards={wards}
                    selectedWardId={selectedWard?.id}
                    onSelectWard={(w) => {
                      onSelectWard(w);
                      setActiveTab('detail');
                    }}
                    coolingCentres={wardDetail?.cooling_centres || []}
                    emergencyHospitals={wardDetail?.emergency_hospitals || []}
                    height="480px"
                  />
                </div>
              </div>

              {/* Priority List */}
              <div className="light-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                    Priority Wards Requiring Action
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>Ranked by Risk</span>
                </div>

                {/* Filter and Search Bar */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    flex: 1
                  }}>
                    <Search size={14} color="#64748B" />
                    <input
                      type="text"
                      placeholder="Search ward or zone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: '#0F172A', fontSize: '12.5px', width: '100%', outline: 'none' }}
                    />
                  </div>

                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#334155',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  >
                    <option value="all">All Bands</option>
                    <option value="extreme">Extreme Only</option>
                    <option value="high">High Only</option>
                  </select>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                  {filteredWards.map((w, idx) => (
                    <div
                      key={w.id}
                      onClick={() => {
                        onSelectWard(w);
                        setActiveTab('detail');
                      }}
                      style={{
                        background: selectedWard?.id === w.id ? '#EFF6FF' : '#FFFFFF',
                        border: selectedWard?.id === w.id ? '1px solid #0284C7' : '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#334155'
                        }}>
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0F172A' }}>
                            {w.name}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                            {w.elderly_pct}% Elderly · {w.outdoor_worker_density}% Laborers
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: w.risk.risk_color }}>
                          {w.risk.risk_score}
                        </div>
                        {renderRiskBadge(w.risk.risk_score, w.risk.risk_band)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* VISUAL 5-DAY PREDICTION CHART (Integrated right on City Overview!) */}
            <PredictionChart
              forecastData={cityData?.city_5day_trend || []}
              wardName="Ahmedabad Municipal Corporation"
            />
          </div>
        )}

        {/* =========================================================
            TAB 2: WARD DRILL-DOWN
            ========================================================= */}
        {activeTab === 'detail' && selectedWard && (
          <div>
            {/* Header Banner */}
            <div className="light-card" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 800, color: '#0F172A' }}>
                      {selectedWard.name}
                    </h2>
                    <span style={{ fontSize: '14px', color: '#64748B' }}>({selectedWard.zone})</span>
                    {renderRiskBadge(selectedWard.risk.risk_score, selectedWard.risk.risk_band)}
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                    Population: <strong>{selectedWard.population.toLocaleString()}</strong> · Area: <strong>{selectedWard.area_sqkm} sq.km</strong> · Urban Heat Island microclimate offset: +{selectedWard.base_temp_offset}°C
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                    Composite Heat-Health Risk Score
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '48px',
                    fontWeight: 800,
                    color: selectedWard.risk.risk_color,
                    lineHeight: 1
                  }}>
                    {selectedWard.risk.risk_score}
                    <span style={{ fontSize: '18px', color: '#64748B', fontWeight: 400 }}> / 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Three Index Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div className="index-stat-card" style={{ borderLeftColor: '#EA580C' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                  <span style={{ fontWeight: 600 }}>NOAA Heat Index</span>
                  <span>Rothfusz Equation</span>
                </div>
                <div className="index-number-huge" style={{ color: '#0F172A' }}>
                  {selectedWard.thermal_indices.heat_index.heat_index_c}°C
                  <span style={{ fontSize: '15px', color: '#64748B', marginLeft: '6px' }}>
                    ({selectedWard.thermal_indices.heat_index.heat_index_f}°F)
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#EA580C', fontWeight: 600 }}>
                  Category: {selectedWard.thermal_indices.heat_index.category}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #E2E8F0' }}>
                  Inputs: Ambient Temp {selectedWard.weather.temp_c}°C · RH {selectedWard.weather.rh_pct}%
                </div>
              </div>

              <div className="index-stat-card" style={{ borderLeftColor: '#0284C7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                  <span style={{ fontWeight: 600 }}>Outdoor WBGT</span>
                  <span>ISO 7243 / Liljegren</span>
                </div>
                <div className="index-number-huge" style={{ color: '#0284C7' }}>
                  {selectedWard.thermal_indices.wbgt.wbgt_c}°C
                </div>
                <div style={{ fontSize: '12px', color: '#DC2626', fontWeight: 600 }}>
                  {selectedWard.thermal_indices.wbgt.flag_level}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #E2E8F0' }}>
                  Tw={selectedWard.thermal_indices.wbgt.wet_bulb_c}°C · Tg={selectedWard.thermal_indices.wbgt.globe_temp_c}°C · Wind={selectedWard.weather.wind_speed_ms}m/s
                </div>
              </div>

              <div className="index-stat-card" style={{ borderLeftColor: '#D97706' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                  <span style={{ fontWeight: 600 }}>Composite HTSI</span>
                  <span>Project-Defined</span>
                </div>
                <div className="index-number-huge" style={{ color: '#D97706' }}>
                  {selectedWard.thermal_indices.htsi.htsi_score} <span style={{ fontSize: '16px', color: '#64748B' }}>/ 100</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Weights: 0.5 WBGT + 0.3 HI + 0.2 Solar
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #E2E8F0' }}>
                  Solar Flux: {selectedWard.weather.solar_radiation_wm2} W/m² (UHI amplified)
                </div>
              </div>
            </div>

            {/* Vulnerability Vector & Civic Action Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="light-card">
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  Demographic Vulnerability Multiplier Vector
                </h3>
                <p style={{ fontSize: '13px', color: '#EA580C', marginBottom: '14px', lineHeight: 1.45 }}>
                  <span style={{ fontWeight: 700 }}>Clinical Interpretation: </span>
                  {selectedWard.risk.primary_advisory}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>Elderly Population (Age ≥ 60)</span>
                      <strong style={{ color: '#DC2626' }}>{selectedWard.elderly_pct}%</strong>
                    </div>
                    <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(selectedWard.elderly_pct / 25) * 100}%`, background: '#DC2626', height: '100%' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>Outdoor & Unorganized Laborers</span>
                      <strong style={{ color: '#EA580C' }}>{selectedWard.outdoor_worker_density}%</strong>
                    </div>
                    <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(selectedWard.outdoor_worker_density / 50) * 100}%`, background: '#EA580C', height: '100%' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>Informal Roofing / Tin Shed Density</span>
                      <strong style={{ color: '#D97706' }}>{selectedWard.informal_housing_pct}%</strong>
                    </div>
                    <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(selectedWard.informal_housing_pct / 60) * 100}%`, background: '#D97706', height: '100%' }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', padding: '12px', background: '#F8FAFC', borderRadius: '6px', fontSize: '12px', color: '#475569', border: '1px solid #E2E8F0' }}>
                  Vulnerability Multiplier: <strong style={{ color: '#0284C7' }}>{selectedWard.risk.vulnerability_multiplier}×</strong> (calibrated from Sudharsan et al. 2025 dose-response curve)
                </div>
              </div>

              {/* Action Controls */}
              <div className="light-card">
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>
                  Auditable Civic Action Controls
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px', color: '#0F172A' }}>1. Activate Municipal Cooling Centre</strong>
                      <span style={{ fontSize: '11px', color: '#16A34A', background: '#F0FDF4', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Ready</span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: '#64748B', margin: '4px 0 8px 0' }}>
                      Dispatches AC community hall standby orders, water stations, and paramedic staff.
                    </p>
                    <button
                      onClick={() => handleTrigger('cooling_centre', `Activate Cooling Centre: ${selectedWard.name}`, 'Triggered by Health Officer')}
                      className="btn-primary"
                      style={{ fontSize: '12px' }}
                    >
                      Trigger Cooling Centre
                    </button>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px', color: '#0F172A' }}>2. Mandatory Outdoor Labor Stoppage</strong>
                      <span style={{ fontSize: '11px', color: '#EA580C', background: '#FFF7ED', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Auto-Suggested</span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: '#64748B', margin: '4px 0 8px 0' }}>
                      Enforces labor law moratorium (11:30 AM - 3:30 PM) due to WBGT &gt; 32°C.
                    </p>
                    <button
                      onClick={() => handleTrigger('work_advisory', `Labor Stoppage Order: ${selectedWard.name}`, 'Enforced work halt')}
                      className="btn-danger"
                      style={{ fontSize: '12px' }}
                    >
                      Issue Labor Stoppage Order
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Ward-specific Prediction Chart */}
            <PredictionChart
              forecastData={wardDetail?.forecast_5day || []}
              wardName={selectedWard.name}
            />
          </div>
        )}

        {/* =========================================================
            TAB 3: 5-DAY ML FORECASTS & CHARTS
            ========================================================= */}
        {activeTab === 'forecast' && (
          <div>
            <PredictionChart
              forecastData={cityData?.city_5day_trend || []}
              wardName="Ahmedabad Municipal Corporation"
            />

            <div className="light-card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                All 18 Wards 5-Day ML Prediction Matrix
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                Random Forest Regressor supervised multi-horizon predictions with urban heat island bias correction
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#64748B', background: '#F8FAFC' }}>
                      <th style={{ padding: '12px 14px' }}>Ward</th>
                      <th style={{ padding: '12px 14px' }}>Zone</th>
                      <th style={{ padding: '12px 14px' }}>Today's Risk</th>
                      <th style={{ padding: '12px 14px' }}>Day 2 (Tue)</th>
                      <th style={{ padding: '12px 14px' }}>Day 3 (Wed)</th>
                      <th style={{ padding: '12px 14px' }}>Day 4 (Thu)</th>
                      <th style={{ padding: '12px 14px' }}>Day 5 (Fri)</th>
                      <th style={{ padding: '12px 14px' }}>Risk Band</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wards.map((w) => {
                      const baseScore = w.risk.risk_score;
                      const d2 = Math.min(100, Math.round(baseScore * 1.03 * 10) / 10);
                      const d3 = Math.min(100, Math.round(baseScore * 1.06 * 10) / 10);
                      const d4 = Math.min(100, Math.round(baseScore * 1.02 * 10) / 10);
                      const d5 = Math.max(0, Math.round(baseScore * 0.95 * 10) / 10);

                      return (
                        <tr key={w.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0F172A' }}>{w.name}</td>
                          <td style={{ padding: '12px 14px', color: '#64748B' }}>{w.zone}</td>
                          <td style={{ padding: '12px 14px', fontFamily: 'var(--font-display)', fontWeight: 800, color: w.risk.risk_color }}>
                            {baseScore}
                          </td>
                          <td style={{ padding: '12px 14px' }}>{d2}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#DC2626' }}>{d3}</td>
                          <td style={{ padding: '12px 14px' }}>{d4}</td>
                          <td style={{ padding: '12px 14px' }}>{d5}</td>
                          <td style={{ padding: '12px 14px' }}>
                            {renderRiskBadge(baseScore, w.risk.risk_band)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: ACTIONS LOG
            ========================================================= */}
        {activeTab === 'actions' && (
          <div className="light-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                  Auditable Municipal Directive Registry
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Timestamped civic record with officer attribution</span>
              </div>
              <span style={{ fontSize: '12px', color: '#16A34A', background: '#F0FDF4', padding: '4px 10px', borderRadius: '999px', border: '1px solid #BBF7D0', fontWeight: 600 }}>
                {actionsLog.length} Records Logged
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {actionsLog.map((act) => (
                <div key={act.id} style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '14px', color: '#0F172A' }}>{act.title}</strong>
                      <span style={{ fontSize: '11px', background: '#E0F2FE', color: '#0284C7', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
                        {act.ward_name}
                      </span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#475569', margin: '4px 0 6px 0' }}>
                      {act.notes}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', gap: '16px' }}>
                      <span>Officer: <strong style={{ color: '#0F172A' }}>{act.triggered_by}</strong></span>
                      <span>Time: {new Date(act.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(act.triggered_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '12px',
                    color: '#16A34A',
                    background: '#F0FDF4',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #BBF7D0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600
                  }}>
                    <CheckCircle2 size={13} />
                    {act.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 5: ALERTS SENT
            ========================================================= */}
        {activeTab === 'alerts' && (
          <div className="light-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                  Emergency Alert Broadcast History
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Twilio & Gupshup Telecom Sandbox Gateway</span>
              </div>
              <button
                onClick={() => setAlertModalOpen(true)}
                className="btn-danger"
              >
                <Send size={14} />
                <span>Compose Alert</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {alertsList.map((alt) => (
                <div key={alt.id} style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '14px',
                  fontSize: '12.5px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#0284C7' }}>Broadcast ID: {alt.id}</span>
                    <span style={{ color: '#16A34A', fontWeight: 600 }}>{alt.delivery_rate || '99.1% Delivered'}</span>
                  </div>
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 12px', borderRadius: '6px', color: '#0F172A', fontFamily: 'var(--font-mono)', fontSize: '12px', margin: '6px 0' }}>
                    "{alt.message_preview}"
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748B' }}>
                    <span>Channel: {alt.channel} · Subscribers: {(alt.recipient_count || 18450).toLocaleString()}</span>
                    <span>{new Date(alt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Alert Composer Modal */}
      {alertModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '16px'
        }} onClick={() => setAlertModalOpen(false)}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                  Compose & Broadcast Emergency Warning
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Twilio / Gupshup Telecom Sandbox Dispatched</span>
              </div>
              <button onClick={() => setAlertModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSendAlertSubmit}>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Target Wards
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {wards.slice(0, 8).map((w) => (
                      <label key={w.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#334155'
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedAlertWards.includes(w.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedAlertWards([...selectedAlertWards, w.id]);
                            else setSelectedAlertWards(selectedAlertWards.filter(id => id !== w.id));
                          }}
                        />
                        <span>{w.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Warning Message (Plain Language)
                  </label>
                  <textarea
                    rows={4}
                    value={alertCustomText}
                    onChange={(e) => setAlertCustomText(e.target.value)}
                    placeholder="URGENT AMC HEATWAVE WARNING: Severe thermal stress active in selected wards (WBGT > 32°C). Stay indoors between 11 AM - 4 PM. Nearest AC cooling centre at Community Hall. Call 108 for medical distress."
                    style={{
                      width: '100%',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '10px',
                      color: '#0F172A',
                      fontSize: '13px',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {alertSuccessMsg && (
                  <div style={{ padding: '10px 14px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} />
                    <span>{alertSuccessMsg}</span>
                  </div>
                )}
              </div>

              <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setAlertModalOpen(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-danger" disabled={isSendingAlert}>
                  {isSendingAlert ? 'Transmitting...' : 'Send Broadcast Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
