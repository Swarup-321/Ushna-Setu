import React, { useState, useEffect } from 'react';
import {
  Flame,
  User,
  Shield,
  HeartPulse,
  Building2,
  BookOpen,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Info
} from 'lucide-react';
import AdminConsole from './components/AdminConsole';
import CitizenPortal from './components/CitizenPortal';
import AshaPortal from './components/AshaPortal';
import ResearcherPortal from './components/ResearcherPortal';

export default function App() {
  // Roles: 'citizen', 'asha', 'officer', 'disaster_mgmt', 'researcher'
  const [activeRole, setActiveRole] = useState('citizen');
  const [cityData, setCityData] = useState(null);
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [wardDetail, setWardDetail] = useState(null);
  const [alertsList, setAlertsList] = useState([]);
  const [actionsLog, setActionsLog] = useState([]);
  const [methodologyData, setMethodologyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulation offsets
  const [simTempOffset, setSimTempOffset] = useState(0.0);
  const [simRhOffset, setSimRhOffset] = useState(0.0);
  const [simSolarOffset, setSimSolarOffset] = useState(0.0);
  const [showSimBar, setShowSimBar] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = `?temp_offset=${simTempOffset}&rh_offset=${simRhOffset}&solar_offset=${simSolarOffset}`;
      
      const [wardsRes, cityRes, alertsRes, actionsRes, methRes] = await Promise.all([
        fetch(`/api/wards${queryParams}`).then(r => r.json()),
        fetch(`/api/city/overview${queryParams}`).then(r => r.json()),
        fetch('/api/alerts').then(r => r.json()),
        fetch('/api/actions').then(r => r.json()),
        fetch('/api/methodology').then(r => r.json())
      ]);

      setWards(wardsRes.wards || []);
      setCityData(cityRes);
      setAlertsList(alertsRes.alerts || []);
      setActionsLog(actionsRes.actions || []);
      setMethodologyData(methRes);

      if (wardsRes.wards && wardsRes.wards.length > 0) {
        const currentId = selectedWard ? selectedWard.id : wardsRes.wards[0].id;
        const matched = wardsRes.wards.find(w => w.id === currentId) || wardsRes.wards[0];
        setSelectedWard(matched);
        fetchWardDetail(matched.id);
      }
    } catch (err) {
      console.error("Backend fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWardDetail = async (wardId) => {
    try {
      const queryParams = `?temp_offset=${simTempOffset}&rh_offset=${simRhOffset}&solar_offset=${simSolarOffset}`;
      const res = await fetch(`/api/wards/${wardId}${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setWardDetail(data);
      }
    } catch (err) {
      console.error("Error fetching ward detail:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [simTempOffset, simRhOffset, simSolarOffset]);

  const handleSelectWard = (ward) => {
    setSelectedWard(ward);
    fetchWardDetail(ward.id);
  };

  const handleTriggerAction = async (payload) => {
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setActionsLog(prev => [data.action, ...prev]);
        if (selectedWard && selectedWard.id === payload.ward_id) {
          fetchWardDetail(selectedWard.id);
        }
      }
    } catch (err) {
      console.error("Error triggering action:", err);
    }
  };

  const handleDispatchAlert = async (payload) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setAlertsList(prev => [data.alert, ...prev]);
        return data;
      }
    } catch (err) {
      console.error("Error dispatching alert:", err);
    }
  };

  return (
    <div className="app-wrapper">
      {/* Universal Clean Light Portal Header */}
      <header className="portal-header">
        <div className="brand-section">
          <div className="brand-badge-icon">
            <Flame size={20} />
          </div>
          <div className="brand-info">
            <div className="brand-title">
              Ushna Setu · उष्ण सेतु
            </div>
            <div className="brand-subtitle">
              Ward-Level Heatwave Early Warning & Thermal Stress Decision Platform · SIH 2026 (NCMRWF)
            </div>
          </div>
        </div>

        {/* PRD Section 2: Role-Based Surface Switcher Capsule */}
        <div className="role-nav-capsule">
          <button
            className={`role-tab-btn ${activeRole === 'citizen' ? 'active' : ''}`}
            onClick={() => setActiveRole('citizen')}
            title="Citizen & Outdoor Worker Public Safety Portal"
          >
            <User size={14} />
            <span>Citizen Portal</span>
          </button>

          <button
            className={`role-tab-btn ${activeRole === 'asha' ? 'active' : ''}`}
            onClick={() => setActiveRole('asha')}
            title="Field Health Worker (ASHA) Household Outreach Mode"
          >
            <HeartPulse size={14} />
            <span>ASHA Worker Mode</span>
          </button>

          <button
            className={`role-tab-btn ${activeRole === 'officer' ? 'active' : ''}`}
            onClick={() => setActiveRole('officer')}
            title="Ward / Municipal Health Officer Diagnostics & Action Layer"
          >
            <Building2 size={14} />
            <span>Ward Health Officer</span>
          </button>

          <button
            className={`role-tab-btn ${activeRole === 'disaster_mgmt' ? 'active' : ''}`}
            onClick={() => setActiveRole('disaster_mgmt')}
            title="City Disaster Management Authority Command Center"
          >
            <Shield size={14} />
            <span>Disaster Authority</span>
          </button>

          <button
            className={`role-tab-btn ${activeRole === 'researcher' ? 'active' : ''}`}
            onClick={() => setActiveRole('researcher')}
            title="NCMRWF & Scientific Researcher Portal"
          >
            <BookOpen size={14} />
            <span>NCMRWF Researcher</span>
          </button>
        </div>

        {/* Right Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowSimBar(!showSimBar)}
            title="Toggle Live What-If Heatwave Simulator"
            style={{
              background: showSimBar ? '#E0F2FE' : '#F1F5F9',
              border: `1px solid ${showSimBar ? '#BAE6FD' : '#E2E8F0'}`,
              color: showSimBar ? '#0284C7' : '#64748B',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Sliders size={14} />
            <span>Simulator</span>
          </button>

          <button
            onClick={fetchData}
            title="Refresh Live Data"
            style={{
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              color: '#334155',
              borderRadius: '6px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {/* Optional Heatwave Simulator Bar */}
      {showSimBar && (
        <section style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '10px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12.5px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284C7', fontWeight: 700 }}>
            <Sliders size={15} />
            <span>Live "What-If" Heat Stress Simulator:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#64748B' }}>Temp Offset:</span>
              <input
                type="range"
                min="-4.0"
                max="6.0"
                step="0.5"
                value={simTempOffset}
                onChange={(e) => setSimTempOffset(parseFloat(e.target.value))}
              />
              <strong style={{ color: simTempOffset > 0 ? '#DC2626' : '#0284C7', minWidth: '45px' }}>
                {simTempOffset > 0 ? `+${simTempOffset}` : simTempOffset}°C
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#64748B' }}>RH Offset:</span>
              <input
                type="range"
                min="-15.0"
                max="25.0"
                step="2.0"
                value={simRhOffset}
                onChange={(e) => setSimRhOffset(parseFloat(e.target.value))}
              />
              <strong style={{ color: '#0F172A', minWidth: '45px' }}>
                {simRhOffset > 0 ? `+${simRhOffset}` : simRhOffset}%
              </strong>
            </div>

            <button
              onClick={() => { setSimTempOffset(0); setSimRhOffset(0); setSimSolarOffset(0); }}
              className="btn-outline"
              style={{ padding: '4px 10px', fontSize: '11px' }}
            >
              Reset to Live Baseline
            </button>
          </div>
        </section>
      )}

      {/* Render Surface Based on Active Persona Role */}
      {activeRole === 'citizen' && (
        <CitizenPortal
          wards={wards}
          selectedWard={selectedWard}
          onSelectWard={handleSelectWard}
          coolingCentres={wardDetail?.cooling_centres || []}
          allCoolingCentres={wardDetail?.all_cooling_centres || []}
          emergencyHospitals={wardDetail?.emergency_hospitals || []}
          forecast5Day={wardDetail?.forecast_5day || []}
          wardDetail={wardDetail}
          latestAlert={alertsList[0] || null}
          alertsList={alertsList}
        />
      )}

      {activeRole === 'asha' && (
        <AshaPortal
          wards={wards}
          selectedWard={selectedWard}
        />
      )}

      {(activeRole === 'officer' || activeRole === 'disaster_mgmt') && (
        <AdminConsole
          cityData={cityData}
          wards={wards}
          selectedWard={selectedWard}
          onSelectWard={handleSelectWard}
          wardDetail={wardDetail}
          onTriggerAction={handleTriggerAction}
          onDispatchAlert={handleDispatchAlert}
          alertsList={alertsList}
          actionsLog={actionsLog}
          methodologyData={methodologyData}
          userRole={activeRole}
        />
      )}

      {activeRole === 'researcher' && (
        <ResearcherPortal
          methodologyData={methodologyData}
          wards={wards}
        />
      )}
    </div>
  );
}
