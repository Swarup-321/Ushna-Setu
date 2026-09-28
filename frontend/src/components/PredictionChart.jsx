import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, ShieldCheck, Thermometer, Wind, Sun } from 'lucide-react';

/* =========================================================================
   PredictionChart — Dark Command Theme
   Full interactive 5-day multi-horizon thermal prediction curve:
   series toggles, threshold danger bands, hover tooltip, summary strip.
   Same props contract: { forecastData, wardName }
   ========================================================================= */

const T = {
  panel: 'rgba(22, 32, 53, 0.7)',
  panelSolid: '#131B2C',
  border: 'rgba(255,255,255,0.08)',
  ink: '#F8FAFC',
  slate: '#94A3B8',
  slateDim: '#64748B',
  cyan: '#00F2FE',
  low: '#34C759',
  moderate: '#E3B341',
  high: '#EA580C',
  extreme: '#FF3B30',
};

const FONT_DISPLAY = "'Fraunces', Georgia, serif";

export default function PredictionChart({ forecastData = [], wardName = 'Ahmedabad City' }) {
  const [activeSeries, setActiveSeries] = useState({
    risk: true,
    wbgt: true,
    temp: true
  });
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!forecastData || forecastData.length === 0) {
    return (
      <div style={{
        background: T.panel, backdropFilter: 'blur(20px)', border: `1px solid ${T.border}`,
        borderRadius: '14px', padding: '30px', textAlign: 'center', color: T.slate, marginBottom: '20px'
      }}>
        No forecast data available
      </div>
    );
  }

  // Chart dimensions
  const svgWidth = 840;
  const svgHeight = 280;
  const padding = { top: 30, right: 40, bottom: 40, left: 50 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Scales
  const n = forecastData.length;
  const getX = (i) => padding.left + (i / (n - 1)) * graphWidth;
  const getYRisk = (val) => padding.top + graphHeight - (val / 100) * graphHeight;
  const getYTemp = (val) => {
    const clamped = Math.max(25, Math.min(50, val));
    return padding.top + graphHeight - ((clamped - 25) / 25) * graphHeight;
  };

  const pointsRisk = forecastData.map((d, i) => `${getX(i)},${getYRisk(d.predicted_risk_score)}`).join(' ');
  const pointsWbgt = forecastData.map((d, i) => `${getX(i)},${getYTemp(d.wbgt_c)}`).join(' ');
  const pointsTemp = forecastData.map((d, i) => `${getX(i)},${getYTemp(d.temp_max_c)}`).join(' ');

  const safeDate = (d) => (d.date ? String(d.date).slice(5) : '');

  return (
    <div style={{
      background: T.panel,
      backdropFilter: 'blur(20px)',
      border: `1px solid ${T.border}`,
      borderRadius: '14px',
      padding: '20px 24px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      marginBottom: '20px'
    }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700;800&display=swap" rel="stylesheet" />

      {/* Chart Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color={T.cyan} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: T.ink, margin: 0 }}>
              5-Day Multi-Horizon Thermal Prediction Curve: {wardName}
            </h3>
          </div>
          <p style={{ fontSize: '12.5px', color: T.slate, marginTop: '2px' }}>
            Random Forest Regressor output vs. Extreme & High Risk threshold boundaries
          </p>
        </div>

        {/* Series Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveSeries(prev => ({ ...prev, risk: !prev.risk }))}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: activeSeries.risk ? 'rgba(255,59,48,0.14)' : 'rgba(255,255,255,0.04)',
              color: activeSeries.risk ? T.extreme : T.slateDim,
              border: `1px solid ${activeSeries.risk ? 'rgba(255,59,48,0.4)' : T.border}`,
              borderRadius: '999px', padding: '4px 12px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: T.extreme }} />
            <span>Risk score (0–100)</span>
          </button>

          <button
            onClick={() => setActiveSeries(prev => ({ ...prev, wbgt: !prev.wbgt }))}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: activeSeries.wbgt ? 'rgba(0,242,254,0.14)' : 'rgba(255,255,255,0.04)',
              color: activeSeries.wbgt ? T.cyan : T.slateDim,
              border: `1px solid ${activeSeries.wbgt ? 'rgba(0,242,254,0.4)' : T.border}`,
              borderRadius: '999px', padding: '4px 12px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: T.cyan }} />
            <span>Outdoor WBGT (°C)</span>
          </button>

          <button
            onClick={() => setActiveSeries(prev => ({ ...prev, temp: !prev.temp }))}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: activeSeries.temp ? 'rgba(234,88,12,0.16)' : 'rgba(255,255,255,0.04)',
              color: activeSeries.temp ? T.high : T.slateDim,
              border: `1px solid ${activeSeries.temp ? 'rgba(234,88,12,0.4)' : T.border}`,
              borderRadius: '999px', padding: '4px 12px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: T.high }} />
            <span>Max ambient temp (°C)</span>
          </button>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <linearGradient id="riskAreaGradDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={T.extreme} stopOpacity="0.28" />
              <stop offset="100%" stopColor={T.extreme} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Threshold Danger Bands */}
          <rect
            x={padding.left} y={getYRisk(100)} width={graphWidth} height={getYRisk(80) - getYRisk(100)}
            fill="rgba(255,59,48,0.08)"
          />
          <line
            x1={padding.left} y1={getYRisk(80)} x2={padding.left + graphWidth} y2={getYRisk(80)}
            stroke="rgba(255,59,48,0.4)" strokeDasharray="4 4" strokeWidth="1.5"
          />
          <text x={padding.left + graphWidth - 6} y={getYRisk(80) - 5} textAnchor="end" fontSize="10" fill={T.extreme} fontWeight="bold">
            Extreme Danger Threshold (80)
          </text>

          <rect
            x={padding.left} y={getYRisk(80)} width={graphWidth} height={getYRisk(60) - getYRisk(80)}
            fill="rgba(234,88,12,0.07)"
          />
          <line
            x1={padding.left} y1={getYRisk(60)} x2={padding.left + graphWidth} y2={getYRisk(60)}
            stroke="rgba(234,88,12,0.4)" strokeDasharray="4 4" strokeWidth="1.5"
          />
          <text x={padding.left + graphWidth - 6} y={getYRisk(60) - 5} textAnchor="end" fontSize="10" fill={T.high} fontWeight="bold">
            High Risk Advisory (60)
          </text>

          {/* Grid lines and Left Axis Labels */}
          {[0, 20, 40, 60, 80, 100].map((val) => (
            <g key={val}>
              <line
                x1={padding.left} y1={getYRisk(val)} x2={padding.left + graphWidth} y2={getYRisk(val)}
                stroke="rgba(255,255,255,0.07)" strokeWidth="1"
              />
              <text x={padding.left - 10} y={getYRisk(val) + 4} textAnchor="end" fontSize="11" fill={T.slate}>
                {val}
              </text>
            </g>
          ))}

          {/* X Axis Day Labels */}
          {forecastData.map((d, i) => (
            <g key={i}>
              <line
                x1={getX(i)} y1={padding.top} x2={getX(i)} y2={padding.top + graphHeight}
                stroke="rgba(255,255,255,0.04)" strokeWidth="1"
              />
              <text x={getX(i)} y={padding.top + graphHeight + 18} textAnchor="middle" fontSize="12" fontWeight="600" fill={T.ink}>
                {d.day_name}
              </text>
              <text x={getX(i)} y={padding.top + graphHeight + 32} textAnchor="middle" fontSize="10" fill={T.slate}>
                {safeDate(d)}
              </text>
            </g>
          ))}

          {/* Series 1: Max Temp Line */}
          {activeSeries.temp && (
            <polyline fill="none" stroke={T.high} strokeWidth="2.5" strokeDasharray="5 3" points={pointsTemp} />
          )}

          {/* Series 2: WBGT Line */}
          {activeSeries.wbgt && (
            <polyline fill="none" stroke={T.cyan} strokeWidth="3" points={pointsWbgt} />
          )}

          {/* Series 3: Risk Score Line with Area Fill */}
          {activeSeries.risk && (
            <>
              <polygon
                fill="url(#riskAreaGradDark)"
                points={`${getX(0)},${padding.top + graphHeight} ${pointsRisk} ${getX(n - 1)},${padding.top + graphHeight}`}
              />
              <polyline fill="none" stroke={T.extreme} strokeWidth="3.5" points={pointsRisk} />
            </>
          )}

          {/* Interactive Data Points */}
          {forecastData.map((d, i) => (
            <g key={i}>
              {activeSeries.risk && (
                <circle
                  cx={getX(i)} cy={getYRisk(d.predicted_risk_score)} r="5.5"
                  fill={T.extreme} stroke={T.panelSolid} strokeWidth="2" style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint({ ...d, x: getX(i), y: getYRisk(d.predicted_risk_score) })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              )}
              {activeSeries.wbgt && (
                <circle
                  cx={getX(i)} cy={getYTemp(d.wbgt_c)} r="4.5"
                  fill={T.cyan} stroke={T.panelSolid} strokeWidth="2" style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint({ ...d, x: getX(i), y: getYTemp(d.wbgt_c) })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              )}
            </g>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div style={{
            position: 'absolute',
            top: Math.max(10, hoveredPoint.y - 70),
            left: Math.min(graphWidth - 100, hoveredPoint.x - 60),
            background: T.panelSolid,
            border: `1px solid rgba(255,255,255,0.14)`,
            borderRadius: '8px',
            padding: '8px 12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
            fontSize: '12px',
            zIndex: 10
          }}>
            <div style={{ fontWeight: 700, color: T.ink, marginBottom: '2px' }}>
              {hoveredPoint.day_name} ({safeDate(hoveredPoint)})
            </div>
            <div style={{ color: T.extreme, fontWeight: 600 }}>
              Predicted risk: <strong>{hoveredPoint.predicted_risk_score}</strong> ({hoveredPoint.risk_band})
            </div>
            <div style={{ color: T.cyan }}>
              WBGT: <strong>{hoveredPoint.wbgt_c}°C</strong>
            </div>
            <div style={{ color: T.high }}>
              Max temp: <strong>{hoveredPoint.temp_max_c}°C</strong>
            </div>
          </div>
        )}
      </div>

      {/* 5-Day Card Summary Strip below Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(5, n)}, 1fr)`, gap: '10px', marginTop: '16px' }}>
        {forecastData.map((d, idx) => {
          const riskColor = d.predicted_risk_score >= 80 ? T.extreme : d.predicted_risk_score >= 60 ? T.high : T.moderate;
          return (
            <div key={idx} style={{
              background: idx === 0 ? 'rgba(0,242,254,0.08)' : 'rgba(255,255,255,0.03)',
              border: idx === 0 ? `1px solid ${T.cyan}44` : `1px solid ${T.border}`,
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '11px', color: T.slate, fontWeight: 600 }}>
                {d.day_name} ({safeDate(d)})
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: '22px', fontWeight: 800, color: T.ink, margin: '4px 0' }}>
                {d.temp_max_c}°
              </div>
              <div style={{ fontSize: '11.5px', color: T.cyan, marginBottom: '4px' }}>
                WBGT: <strong>{d.wbgt_c}°C</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: T.slate }}>Risk:</span>
                <strong style={{ color: riskColor }}>{d.predicted_risk_score}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}