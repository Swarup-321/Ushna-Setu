import React, { useState } from 'react';
import { BookOpen, FlaskConical, FileText, Link as LinkIcon, Download, Info } from 'lucide-react';

/* PLACEHOLDER — replace with your real Methodology / NCMRWF Researcher screen
   when ready. Kept in the light Admin theme so it doesn't clash with AdminConsole. */
export default function ResearcherPortal({ methodologyData, wards = [] }) {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Index Overview', icon: BookOpen },
    { id: 'formulas', label: 'Formulas & Citations', icon: FlaskConical },
    { id: 'data', label: 'Data Export', icon: FileText }
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 65px)', background: 'var(--warm-bg)', backgroundAttachment: 'fixed' }}>
      <aside style={{ width: '240px', background: 'rgba(255, 255, 255, 0.95)', borderRight: '1px solid var(--warm-border)', padding: '20px 12px', flexShrink: 0 }}>
        <div style={{ fontSize: '11px', color: '#9A3412', fontWeight: 700, textTransform: 'uppercase', padding: '0 8px 12px', letterSpacing: '0.04em' }}>
          NCMRWF Researcher
        </div>
        {sections.map((s) => {
          const Icon = s.icon;
          const isActive = activeSection === s.id;
          return (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '10px', marginBottom: '4px', fontSize: '13px',
              fontWeight: isActive ? 700 : 500, cursor: 'pointer',
              background: isActive ? '#FFF7ED' : 'transparent',
              color: isActive ? '#EA580C' : '#334155',
              border: isActive ? '1px solid var(--warm-border)' : '1px solid transparent',
              transition: 'all 0.15s ease'
            }}>
              <Icon size={15} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </aside>

      <main style={{ flex: 1, padding: '28px 36px', maxWidth: '1100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Info size={16} color="#EA580C" />
          <span style={{ fontSize: '12px', color: '#9A3412', fontWeight: 700 }}>
            Methodology & Thermal Physics Engine (Section 6.7 of PRD)
          </span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#9A3412', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
          Thermal Index Methodology & Data Access
        </h1>
        <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '24px', maxWidth: '700px' }}>
          Heat Index (NOAA Rothfusz), outdoor WBGT (ISO 7243 / Liljegren estimate), the project-defined
          composite HTSI, and the literature-calibrated vulnerability multiplier are documented here for
          scientific review, citing Kacker et al. 2025/2026, Kumar et al. 2026, Sudharsan et al. 2025 and
          Banerjee et al. 2024.
        </p>

        {activeSection === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { title: 'Heat Index (HI)', desc: 'NOAA Rothfusz polynomial regression on temperature and relative humidity.' },
              { title: 'Wet Bulb Globe Temp (WBGT)', desc: 'ISO 7243 / Liljegren-style estimate from temp, RH, wind, solar radiation.' },
              { title: 'Composite HTSI (0-100)', desc: 'Project-defined: 0.5×WBGT + 0.3×HI + 0.2×Solar load (normalized).' }
            ].map((c) => (
              <div key={c.title} style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px' }}>
                <strong style={{ fontSize: '13.5px', color: '#0F172A' }}>{c.title}</strong>
                <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '6px' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'formulas' && (
          <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '20px', fontSize: '13px', color: '#334155' }}>
            <p>Full formula derivations and citation list go here — paste your Methodology content when ready.</p>
          </div>
        )}

        {activeSection === 'data' && (
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0284C7', color: '#fff',
            border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
          }}>
            <Download size={14} />
            <span>Export Ward Dataset (CSV)</span>
          </button>
        )}
      </main>
    </div>
  );
}