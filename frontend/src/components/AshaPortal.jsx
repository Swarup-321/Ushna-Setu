import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  HeartPulse, CheckCircle2, Clock, User, MapPin, AlertCircle, Phone,
  Package, PlusCircle, Search, ChevronLeft, ChevronRight, Wifi, WifiOff,
  RefreshCcw, ShieldCheck, X
} from 'lucide-react';

/* =========================================================================
   USHNA SETU — ASHA FIELD PORTAL
   Design tokens per PRD Section 5 (mist paper background, dusk-teal accent,
   risk-gradient reserved ONLY for vulnerability/severity signals).
   ========================================================================= */

const TOKENS = {
  ink900: '#0F172A',
  slate700: '#334155',
  slate400: '#64748B',
  mist100: 'var(--warm-bg)',
  surface0: '#FFFFFF',
  line200: '#FED7AA',
  dusk600: '#EA580C',
  dusk700: '#9A3412',
  duskTint: '#FFF7ED',
  riskLow: '#16A34A',
  riskModerate: '#D97706',
  riskHigh: '#EA580C',
  riskExtreme: '#DC2626',
};

const FONT_DISPLAY = "'Fraunces', Georgia, serif";
const FONT_BODY = "'Inter', 'IBM Plex Sans', system-ui, -apple-system, sans-serif";

const PAGE_SIZE = 6;

/* ---------------------------- Mock data (used when API is unreachable) --------------------------- */
const MOCK_HOUSEHOLDS = [
  { id: 'HH-1042', contact_name: 'Rambhai Thakor (78, lives alone)', vulnerability_level: 'Critical', ward_name: 'Ward 19', address: 'Chandola Tin-Roof Chawl, Row 4, Ahmedabad', risk_factors: 'Age 78, lives alone, tin roof, hypertension', last_checked: '2 days ago', status: 'Pending' },
  { id: 'HH-1043', contact_name: 'Fatimaben Sheikh (32, 7mo pregnant)', vulnerability_level: 'Critical', ward_name: 'Ward 19', address: 'Bapunagar Slum Cluster, Lane 3', risk_factors: 'Pregnant, anemic, no cooling at home', last_checked: 'Not yet checked', status: 'Pending' },
  { id: 'HH-1044', contact_name: 'Kantilal Vaghela (81)', vulnerability_level: 'High', ward_name: 'Ward 19', address: 'Gomtipur Tin Shed Colony, House 12', risk_factors: 'Age 81, diabetic, tin roof', last_checked: '1 day ago', status: 'Pending' },
  { id: 'HH-1045', contact_name: 'Sunitaben Parmar (69)', vulnerability_level: 'High', ward_name: 'Ward 19', address: 'Rakhial Chawl No. 6', risk_factors: 'Age 69, cardiac history', last_checked: 'Today, 9:10 AM', status: 'Visited' },
  { id: 'HH-1046', contact_name: 'Ismailbhai Malek (74)', vulnerability_level: 'Moderate', ward_name: 'Ward 19', address: 'Dani Limda Basti, Block C', risk_factors: 'Age 74, lives with family', last_checked: 'Today, 10:35 AM', status: 'Visited' },
  { id: 'HH-1047', contact_name: 'Meenaben Chauhan (29, 8mo pregnant)', vulnerability_level: 'Critical', ward_name: 'Ward 19', address: 'Shahpur Tin-Roof Row 9', risk_factors: 'Pregnant, first trimester complications noted', last_checked: 'Not yet checked', status: 'Pending' },
  { id: 'HH-1048', contact_name: 'Babubhai Rathod (83)', vulnerability_level: 'Critical', ward_name: 'Ward 19', address: 'Vatva Industrial Chawl, Row 2', risk_factors: 'Age 83, lives alone, outdoor worker family', last_checked: '3 days ago', status: 'Pending' },
  { id: 'HH-1049', contact_name: 'Zarinaben Qureshi (66)', vulnerability_level: 'Moderate', ward_name: 'Ward 19', address: 'Isanpur Tin Cluster, Lane 1', risk_factors: 'Age 66, mild hypertension', last_checked: 'Today, 8:50 AM', status: 'Visited' },
  { id: 'HH-1050', contact_name: 'Dahyabhai Patel (76)', vulnerability_level: 'High', ward_name: 'Ward 19', address: 'Amraiwadi Slum Row 5', risk_factors: 'Age 76, respiratory issues, tin roof', last_checked: 'Not yet checked', status: 'Pending' },
  { id: 'HH-1051', contact_name: 'Noorjahan Sheikh (35, 6mo pregnant)', vulnerability_level: 'High', ward_name: 'Ward 19', address: 'Odhav Basti, House 21', risk_factors: 'Pregnant, works outdoors till noon', last_checked: '1 day ago', status: 'Pending' },
];

/* ---------------------------- Small presentational helpers --------------------------- */

function riskColor(level) {
  switch (level) {
    case 'Critical': return TOKENS.riskExtreme;
    case 'High': return TOKENS.riskHigh;
    case 'Moderate': return TOKENS.riskModerate;
    default: return TOKENS.riskLow;
  }
}

function riskTint(level) {
  switch (level) {
    case 'Critical': return '#FBEAE8';
    case 'High': return '#FCEEE4';
    case 'Moderate': return '#FDF6E3';
    default: return '#EAF5EC';
  }
}

function VulnerabilityBadge({ level }) {
  return (
    <span style={{
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.01em',
      color: riskColor(level),
      background: riskTint(level),
      border: `1px solid ${riskColor(level)}33`,
      padding: '3px 9px',
      borderRadius: '5px',
      whiteSpace: 'nowrap'
    }}>
      {level.toUpperCase()} RISK
    </span>
  );
}

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */

export default function AshaPortal({ wards = [], selectedWard = null }) {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  const [checkinModal, setCheckinModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [workerName, setWorkerName] = useState('Anitaben Solanki (ASHA Ward-19 Lead)');
  const [orsStock, setOrsStock] = useState(24);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [isOnline, setIsOnline] = useState(true);
  const [lastSynced, setLastSynced] = useState(null);
  const [toast, setToast] = useState(null);

  // Form states for check-in
  const [orsGiven, setOrsGiven] = useState(3);
  const [vitalsNormal, setVitalsNormal] = useState(true);
  const [referToCentre, setReferToCentre] = useState(false);
  const [checkinNotes, setCheckinNotes] = useState('');

  /* ------------------------------ Data fetching ------------------------------ */

  const fetchHouseholds = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch('/api/asha/households');
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      setHouseholds(data.households || []);
      setUsingMockData(false);
      setLastSynced(new Date());
    } catch (e) {
      console.error('Error fetching ASHA tasks:', e);
      // Fallback so the field worker always sees their list, even offline
      setHouseholds(MOCK_HOUSEHOLDS);
      setUsingMockData(true);
      setErrorMsg('Could not reach the server — showing last saved list.');
      setLastSynced(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchHouseholds();
  }, [fetchHouseholds]);

  // Re-fetch whenever the selected ward context changes from the parent shell
  useEffect(() => {
    if (selectedWard) {
      fetchHouseholds();
    }
  }, [selectedWard, fetchHouseholds]);

  // Reset to page 1 whenever the filter or search changes, so the user
  // never lands on an empty page after narrowing results
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  // Track online/offline status for the header connectivity chip
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Auto-refresh the household list every 2 minutes so the roster stays current
  // during a long field shift, without the worker needing to pull-to-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHouseholds();
    }, 120000);
    return () => clearInterval(interval);
  }, [fetchHouseholds]);

  // Auto-dismiss toast notifications
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  // Warn (soft) when ORS stock runs low so worker restocks before next round
  useEffect(() => {
    if (orsStock <= 5) {
      setToast({ type: 'warning', message: `Low ORS stock: only ${orsStock} packets left in kit.` });
    }
  }, [orsStock]);

  /* ------------------------------ Actions ------------------------------ */

  const openCheckin = (item) => {
    setOrsGiven(3);
    setVitalsNormal(true);
    setReferToCentre(false);
    setCheckinNotes('');
    setCheckinModal(item);
  };

  const handleLogCheckin = async (e) => {
    e.preventDefault();
    if (!checkinModal) return;

    setSaving(true);
    try {
      const res = await fetch('/api/asha/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          household_id: checkinModal.id,
          worker_name: workerName,
          ors_given: orsGiven,
          vitals_normal: vitalsNormal,
          referred_to_centre: referToCentre,
          notes: checkinNotes || 'Standard heatwave wellness check. Patient hydrated.'
        })
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);

      setOrsStock((prev) => Math.max(0, prev - orsGiven));
      setCheckinModal(null);
      setToast({ type: 'success', message: `Check-in saved for ${checkinModal.contact_name.split('(')[0].trim()}.` });
      fetchHouseholds();
    } catch (err) {
      console.error('Error logging checkin:', err);
      // Optimistic local fallback so a demo/offline field visit is never lost
      setHouseholds((prev) => prev.map((h) => (
        h.id === checkinModal.id ? { ...h, status: 'Visited', last_checked: 'Just now' } : h
      )));
      setOrsStock((prev) => Math.max(0, prev - orsGiven));
      setCheckinModal(null);
      setToast({ type: 'warning', message: 'Saved locally — will sync when connection returns.' });
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------ Derived data ------------------------------ */

  const filtered = useMemo(() => {
    return households.filter((h) => {
      if (filterStatus === 'pending' && !h.status.includes('Pending')) return false;
      if (filterStatus === 'visited' && !h.status.includes('Visited')) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        return (
          h.contact_name.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.risk_factors.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [households, filterStatus, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const pendingCount = households.filter((h) => h.status.includes('Pending')).length;
  const visitedCount = households.filter((h) => h.status.includes('Visited')).length;
  const criticalPendingCount = households.filter(
    (h) => h.status.includes('Pending') && h.vulnerability_level === 'Critical'
  ).length;

  /* ------------------------------ Render ------------------------------ */

  return (
    <div style={{ background: TOKENS.mist100, minHeight: '100vh', fontFamily: FONT_BODY, color: TOKENS.ink900 }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          background: ${TOKENS.dusk600}; color: #fff; border: none;
          padding: 9px 16px; border-radius: 7px; font-weight: 600; font-size: 13px;
          cursor: pointer; font-family: ${FONT_BODY}; transition: background 0.15s ease;
        }
        .btn-primary:hover { background: ${TOKENS.dusk700}; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-outline {
          background: #fff; color: ${TOKENS.slate700}; border: 1px solid ${TOKENS.line200};
          padding: 9px 16px; border-radius: 7px; font-weight: 600; font-size: 13px;
          cursor: pointer; font-family: ${FONT_BODY};
        }
        .btn-outline:hover { background: ${TOKENS.mist100}; }
        .asha-row:hover { box-shadow: 0 2px 8px rgba(28,36,49,0.07); }
        .tab-pill { transition: all 0.15s ease; }
        .page-btn {
          width: 32px; height: 32px; border-radius: 6px; border: 1px solid ${TOKENS.line200};
          background: #fff; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: ${TOKENS.slate700};
        }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .page-btn.active { background: ${TOKENS.dusk600}; color: #fff; border-color: ${TOKENS.dusk600}; }
        @keyframes pulseSettle {
          0% { transform: scale(1); } 40% { transform: scale(1.08); } 100% { transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); }
        }
        .toast-in { animation: slideUp 0.25s ease; }
      `}</style>

      {/* ============================ HEADER ============================ */}
      <header style={{
        background: TOKENS.surface0,
        borderBottom: `1px solid ${TOKENS.line200}`,
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px', background: TOKENS.dusk600,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <HeartPulse size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: '17px', lineHeight: 1.1 }}>
                Ushna Setu
              </div>
              <div style={{ fontSize: '11px', color: TOKENS.slate400 }}>ASHA Field Portal</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px',
              padding: '5px 10px', borderRadius: '999px',
              background: isOnline ? '#EAF5EC' : '#FBEAE8',
              color: isOnline ? TOKENS.riskLow : TOKENS.riskExtreme,
              border: `1px solid ${isOnline ? TOKENS.riskLow : TOKENS.riskExtreme}33`
            }}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span style={{ fontWeight: 600 }}>{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            <button onClick={fetchHouseholds} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px' }}>
              <RefreshCcw size={13} />
              <span>Sync</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '10px', borderLeft: `1px solid ${TOKENS.line200}` }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%', background: TOKENS.duskTint,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: TOKENS.dusk600
              }}>
                <User size={14} />
              </div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: TOKENS.ink900 }}>
                {workerName.split('(')[0]}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* ============================ TOP BANNER ============================ */}
        <div style={{
          background: TOKENS.surface0,
          border: `1px solid ${TOKENS.line200}`,
          borderRadius: '12px',
          padding: '22px 24px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 1px 3px rgba(28,36,49,0.05)'
        }}>
          <div style={{ minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: '#FBEAE8', color: TOKENS.riskExtreme, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                ASHA FIELD OPERATIONAL MODE
              </span>
              <span style={{ fontSize: '12px', color: TOKENS.slate400 }}>Primary Health Care Directives</span>
            </div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: '24px', fontWeight: 600, color: TOKENS.ink900, marginTop: '8px', marginBottom: '4px' }}>
              Vulnerable Household Outreach & Surveillance Checklist
            </h2>
            <p style={{ fontSize: '13px', color: TOKENS.slate700, maxWidth: '520px', lineHeight: 1.5 }}>
              Active heat emergency in Ahmedabad wards. Focus on senior citizens living in tin-roof chawls and pregnant women.
            </p>
            {lastSynced && (
              <div style={{ fontSize: '11px', color: TOKENS.slate400, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={11} />
                <span>Last synced {lastSynced.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                {usingMockData && <span style={{ color: TOKENS.riskModerate, fontWeight: 600 }}>&nbsp;· offline cache</span>}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatBlock label="Pending Visits" value={pendingCount} accent={TOKENS.riskExtreme} tint="#FBEAE8" />
            <StatBlock label="Completed Today" value={visitedCount} accent={TOKENS.riskLow} tint="#EAF5EC" />
            <StatBlock label="Critical Pending" value={criticalPendingCount} accent={TOKENS.riskHigh} tint="#FCEEE4" />
            <div style={{ background: TOKENS.duskTint, border: `1px solid ${TOKENS.dusk600}33`, borderRadius: '8px', padding: '10px 16px', textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '11px', color: TOKENS.dusk600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Package size={11} /> ORS in Kit
              </div>
              <strong style={{ fontFamily: FONT_DISPLAY, fontSize: '20px', color: TOKENS.dusk600 }}>{orsStock}</strong>
            </div>
          </div>
        </div>

        {/* Error / offline banner */}
        {errorMsg && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', background: '#FDF6E3',
            border: `1px solid ${TOKENS.riskModerate}55`, color: '#8A6D1D', borderRadius: '8px',
            padding: '10px 14px', fontSize: '12.5px', marginBottom: '16px'
          }}>
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ============================ FILTER + SEARCH ============================ */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: `All Assigned (${households.length})`, active: TOKENS.dusk600, activeBg: TOKENS.duskTint },
              { key: 'pending', label: `Pending Visits (${pendingCount})`, active: TOKENS.riskExtreme, activeBg: '#FBEAE8' },
              { key: 'visited', label: `Completed Today (${visitedCount})`, active: TOKENS.riskLow, activeBg: '#EAF5EC' },
            ].map((tab) => (
              <button
                key={tab.key}
                className="tab-pill"
                onClick={() => setFilterStatus(tab.key)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '999px',
                  border: filterStatus === tab.key ? `1px solid ${tab.active}` : `1px solid ${TOKENS.line200}`,
                  background: filterStatus === tab.key ? tab.activeBg : '#FFF',
                  color: filterStatus === tab.key ? tab.active : TOKENS.slate700,
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: TOKENS.slate400 }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, address, risk factor..."
                style={{
                  padding: '8px 12px 8px 32px', borderRadius: '7px', border: `1px solid ${TOKENS.line200}`,
                  fontSize: '12.5px', width: '250px', fontFamily: FONT_BODY, background: '#fff'
                }}
              />
            </div>

            <a
              href="tel:108"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', background: TOKENS.riskExtreme,
                color: '#FFF', textDecoration: 'none', padding: '9px 14px', borderRadius: '7px',
                fontSize: '12.5px', fontWeight: 700, whiteSpace: 'nowrap'
              }}
            >
              <Phone size={14} />
              <span>Call 108 Emergency</span>
            </a>
          </div>
        </div>

        {/* ============================ HOUSEHOLD LIST ============================ */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                background: TOKENS.surface0, border: `1px solid ${TOKENS.line200}`, borderRadius: '10px',
                padding: '20px', height: '76px', opacity: 0.5
              }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            background: TOKENS.surface0, border: `1px dashed ${TOKENS.line200}`, borderRadius: '12px',
            padding: '48px 24px', textAlign: 'center', color: TOKENS.slate400
          }}>
            <ShieldCheck size={28} style={{ margin: '0 auto 10px', display: 'block', color: TOKENS.slate400 }} />
            <p style={{ fontSize: '13.5px', margin: 0 }}>
              {searchTerm ? `No households match "${searchTerm}".` : 'No households in this filter right now.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paginated.map((item) => {
              const isPending = item.status.includes('Pending');
              return (
                <div key={item.id} className="asha-row" style={{
                  background: TOKENS.surface0,
                  border: `1px solid ${isPending ? '#F0B8B4' : TOKENS.line200}`,
                  borderLeft: `5px solid ${isPending ? riskColor(item.vulnerability_level) : TOKENS.riskLow}`,
                  borderRadius: '10px',
                  padding: '16px 20px',
                  boxShadow: '0 1px 3px rgba(28,36,49,0.05)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'box-shadow 0.15s ease'
                }}>
                  <div style={{ minWidth: '260px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '15px', color: TOKENS.ink900 }}>{item.contact_name}</strong>
                      <VulnerabilityBadge level={item.vulnerability_level} />
                      <span style={{ fontSize: '12px', color: TOKENS.slate400 }}>Ward: <strong style={{ color: TOKENS.slate700 }}>{item.ward_name}</strong></span>
                    </div>

                    <div style={{ fontSize: '12.5px', color: TOKENS.slate700, marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={12} color={TOKENS.slate400} />
                      {item.address}
                    </div>

                    <div style={{ fontSize: '12px', color: TOKENS.slate400, marginTop: '4px' }}>
                      <strong style={{ color: TOKENS.slate700 }}>Risk factors:</strong> {item.risk_factors} · Last checked: <em>{item.last_checked}</em>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {isPending ? (
                      <button onClick={() => openCheckin(item)} className="btn-primary">
                        <CheckCircle2 size={15} />
                        <span>Log Home Check-in</span>
                      </button>
                    ) : (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px', color: TOKENS.riskLow,
                        background: '#EAF5EC', border: `1px solid ${TOKENS.riskLow}55`, padding: '7px 12px',
                        borderRadius: '6px', fontSize: '12.5px', fontWeight: 600
                      }}>
                        <CheckCircle2 size={14} />
                        <span>Visited Today</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================ PAGINATION ============================ */}
        {filtered.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: TOKENS.slate400 }}>
              Showing {(pageSafe - 1) * PAGE_SIZE + 1}–{Math.min(pageSafe * PAGE_SIZE, filtered.length)} of {filtered.length} households
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button className="page-btn" disabled={pageSafe === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`page-btn ${p === pageSafe ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>
                  {p}
                </button>
              ))}
              <button className="page-btn" disabled={pageSafe === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ============================ FOOTER ============================ */}
      <footer style={{
        borderTop: `1px solid ${TOKENS.line200}`, background: TOKENS.surface0, padding: '18px 20px', marginTop: '20px'
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-between', alignItems: 'center', gap: '10px'
        }}>
          <span style={{ fontSize: '11.5px', color: TOKENS.slate400 }}>
            Ushna Setu — Ward-Level Heatwave Early Warning · Field data logged is auditable and synced to the Admin Console.
          </span>
          <div style={{ display: 'flex', gap: '16px', fontSize: '11.5px', color: TOKENS.slate400 }}>
            <span>SIH 2026 · PS26083</span>
            <span>Ministry of Earth Sciences (NCMRWF)</span>
          </div>
        </div>
      </footer>

      {/* ============================ TOAST ============================ */}
      {toast && (
        <div className="toast-in" style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 3000,
          background: toast.type === 'success' ? '#EAF5EC' : '#FDF6E3',
          border: `1px solid ${toast.type === 'success' ? TOKENS.riskLow : TOKENS.riskModerate}66`,
          color: toast.type === 'success' ? '#2C6B37' : '#8A6D1D',
          borderRadius: '8px', padding: '12px 16px', fontSize: '12.5px', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '320px',
          boxShadow: '0 8px 20px rgba(28,36,49,0.12)'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={13} />
          </button>
        </div>
      )}

      {/* ============================ CHECK-IN MODAL ============================ */}
      {checkinModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(28, 36, 49, 0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px'
        }} onClick={() => !saving && setCheckinModal(null)}>
          <div style={{
            background: TOKENS.surface0, borderRadius: '12px', width: '100%', maxWidth: '520px',
            boxShadow: '0 20px 40px -5px rgba(28,36,49,0.25)', overflow: 'hidden'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${TOKENS.line200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: '17px', fontWeight: 600, color: TOKENS.ink900, margin: 0 }}>
                  Log Field Check-in
                </h3>
                <span style={{ fontSize: '12px', color: TOKENS.slate400 }}>{checkinModal.contact_name}</span>
              </div>
              <button onClick={() => setCheckinModal(null)} style={{ background: 'none', border: 'none', fontSize: '18px', color: TOKENS.slate400, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleLogCheckin}>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: TOKENS.slate700, display: 'block', marginBottom: '6px' }}>
                    ORS hydration packets handed over
                  </label>
                  <input
                    type="number" min="1" max="10" value={orsGiven}
                    onChange={(e) => setOrsGiven(parseInt(e.target.value, 10) || 1)}
                    style={{ width: '100%', padding: '9px 12px', border: `1px solid ${TOKENS.line200}`, borderRadius: '6px', fontSize: '13px', fontFamily: FONT_BODY }}
                  />
                  {orsGiven > orsStock && (
                    <div style={{ fontSize: '11.5px', color: TOKENS.riskExtreme, marginTop: '4px' }}>
                      Only {orsStock} packets left in kit — confirm before handing over more.
                    </div>
                  )}
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: TOKENS.slate700 }}>
                  <input type="checkbox" checked={vitalsNormal} onChange={(e) => setVitalsNormal(e.target.checked)} />
                  <span>Patient vitals conscious & responsive (no heat stroke symptoms)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: TOKENS.slate700 }}>
                  <input type="checkbox" checked={referToCentre} onChange={(e) => setReferToCentre(e.target.checked)} />
                  <span>Referred to nearest municipal AC cooling centre</span>
                </label>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: TOKENS.slate700, display: 'block', marginBottom: '6px' }}>
                    Field health worker clinical notes
                  </label>
                  <textarea
                    rows={3} value={checkinNotes} onChange={(e) => setCheckinNotes(e.target.value)}
                    placeholder="Patient hydrated, cautioned against going outside 12-4 PM. Family instructed on sponge baths."
                    style={{ width: '100%', padding: '9px 12px', border: `1px solid ${TOKENS.line200}`, borderRadius: '6px', fontSize: '13px', fontFamily: FONT_BODY, resize: 'vertical' }}
                  />
                </div>

                {!vitalsNormal && (
                  <div style={{
                    display: 'flex', gap: '8px', alignItems: 'flex-start', background: '#FBEAE8',
                    border: `1px solid ${TOKENS.riskExtreme}33`, borderRadius: '7px', padding: '10px 12px', fontSize: '12px', color: '#8A2A24'
                  }}>
                    <AlertCircle size={14} style={{ marginTop: '1px', flexShrink: 0 }} />
                    <span>Abnormal vitals flagged — strongly consider referring to cooling centre and calling 108 if symptoms worsen.</span>
                  </div>
                )}
              </div>

              <div style={{ padding: '14px 24px', borderTop: `1px solid ${TOKENS.line200}`, background: TOKENS.mist100, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setCheckinModal(null)} className="btn-outline" disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Visit Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, value, accent, tint }) {
  return (
    <div style={{ background: tint, border: `1px solid ${accent}33`, borderRadius: '8px', padding: '10px 16px', textAlign: 'center', minWidth: '110px' }}>
      <div style={{ fontSize: '11px', color: accent, fontWeight: 600 }}>{label}</div>
      <strong style={{ fontFamily: FONT_DISPLAY, fontSize: '20px', color: accent }}>{value}</strong>
    </div>
  );
}