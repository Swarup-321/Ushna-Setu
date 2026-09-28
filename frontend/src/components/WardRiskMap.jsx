import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Locate, ShieldAlert, ThermometerSnowflake, Hospital, Layers } from 'lucide-react';

export default function WardRiskMap({
  wards = [],
  selectedWardId = null,
  onSelectWard = () => {},
  coolingCentres = [],
  emergencyHospitals = [],
  height = '520px',
  compact = false
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const coolingLayerRef = useRef(null);
  const hospitalLayerRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [showCooling, setShowCooling] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);

  // Initialize Map with OpenStreetMap / CartoDB fallback
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [23.0225, 72.5714],
        zoom: compact ? 11 : 12,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Reliable OpenStreetMap tiles (no API key needed)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      L.control.attribution({ position: 'bottomright', prefix: 'NCMRWF · Ushna Setu GIS' }).addTo(map);

      mapInstanceRef.current = map;

      // Invalidate size after layout settles to guarantee complete rendering
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    // ResizeObserver to automatically resize map when tabs or containers toggle
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Ward Polygons with Clean Light Theme Styling
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !wards || wards.length === 0) return;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }

    const geoJsonData = {
      type: "FeatureCollection",
      features: wards.map(w => ({
        type: "Feature",
        id: w.id,
        properties: {
          id: w.id,
          name: w.name,
          zone: w.zone,
          risk_score: w.risk?.risk_score ?? 50,
          risk_band: w.risk?.risk_band ?? 'Moderate',
          risk_color: w.risk?.risk_color ?? '#D97706',
          temp_c: w.weather?.temp_c,
          wbgt_c: w.thermal_indices?.wbgt?.wbgt_c,
          elderly_pct: w.elderly_pct,
          outdoor_worker_density: w.outdoor_worker_density,
          informal_housing_pct: w.informal_housing_pct,
          population: w.population
        },
        geometry: w.geometry
      }))
    };

    const layer = L.geoJSON(geoJsonData, {
      style: (feature) => {
        const isSelected = feature.properties.id === selectedWardId;
        const score = feature.properties.risk_score;
        
        let color = '#16A34A';
        if (score >= 80) color = '#DC2626';
        else if (score >= 60) color = '#EA580C';
        else if (score >= 40) color = '#D97706';

        return {
          fillColor: color,
          weight: isSelected ? 3.5 : 1.5,
          opacity: 1,
          color: isSelected ? '#0F172A' : '#FFFFFF',
          fillOpacity: isSelected ? 0.85 : (score >= 80 ? 0.75 : 0.62)
        };
      },
      onEachFeature: (feature, layerItem) => {
        const p = feature.properties;
        
        const tooltipHtml = `
          <div style="font-family: 'Inter', sans-serif; font-size: 12px; line-height: 1.45; min-width: 175px; background: #FFFFFF; color: #0F172A; padding: 6px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border: 1px solid #E2E8F0;">
            <div style="font-weight: 700; font-size: 14px; color: #0F172A; margin-bottom: 2px;">${p.name}</div>
            <div style="color: #64748B; font-size: 11px; margin-bottom: 6px;">${p.zone}</div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #475569;">Risk Score:</span>
              <strong style="color: ${p.risk_color}; font-size: 15px; font-family: 'Fraunces', serif;">${p.risk_score}</strong>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #475569;">Outdoor WBGT:</span>
              <strong style="color: #0284C7;">${p.wbgt_c}°C</strong>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #64748B;">
              <span>Vulnerability:</span>
              <span>${p.elderly_pct}% Elderly · ${p.outdoor_worker_density}% Labor</span>
            </div>
          </div>
        `;
        layerItem.bindTooltip(tooltipHtml, { sticky: true });

        layerItem.on({
          mouseover: (e) => {
            const target = e.target;
            target.setStyle({
              weight: 3,
              fillOpacity: 0.95,
              color: '#0284C7'
            });
            target.bringToFront();
          },
          mouseout: (e) => {
            layer.resetStyle(e.target);
            if (feature.properties.id === selectedWardId) {
              e.target.setStyle({
                weight: 3.5,
                color: '#0F172A',
                fillOpacity: 0.85
              });
            }
          },
          click: () => {
            const matched = wards.find(w => w.id === feature.properties.id);
            if (matched) onSelectWard(matched);
          }
        });
      }
    }).addTo(map);

    geoJsonLayerRef.current = layer;

    if (selectedWardId) {
      const selectedFeature = geoJsonData.features.find(f => f.properties.id === selectedWardId);
      if (selectedFeature) {
        const bounds = L.geoJSON(selectedFeature).getBounds();
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [wards, selectedWardId]);

  // Update Cooling Centres layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (coolingLayerRef.current) {
      map.removeLayer(coolingLayerRef.current);
      coolingLayerRef.current = null;
    }

    if (showCooling && coolingCentres.length > 0) {
      const validCentres = coolingCentres.filter(c => 
        c && typeof c.lat === 'number' && typeof c.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng)
      );

      const markers = validCentres.map(c => {
        try {
          const icon = L.divIcon({
            className: 'light-cooling-pin',
            html: `<div style="background-color: #0284C7; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(2,132,199,0.4); border: 2px solid white; font-size: 13px;">❄</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });

          const m = L.marker([c.lat, c.lng], { icon });
          m.bindPopup(`
            <div style="font-family: 'Inter', sans-serif; font-size: 12px; line-height: 1.45; color: #0F172A;">
              <div style="font-weight: 700; color: #0284C7; font-size: 13px;">${c.name}</div>
              <div style="color: #64748B; font-size: 11px; margin-bottom: 4px;">${c.type || 'Cooling Shelter'}</div>
              <div><strong>Capacity:</strong> ${c.capacity || 200} persons</div>
              <div><strong>Status:</strong> <span style="color: #16A34A; font-weight: 600;">${c.status || 'Active'}</span></div>
              <div><strong>Emergency Desk:</strong> ${c.phone || '+91 79 2535 4100'}</div>
            </div>
          `);
          return m;
        } catch (e) {
          console.warn("Error creating cooling marker:", e);
          return null;
        }
      }).filter(Boolean);

      coolingLayerRef.current = L.layerGroup(markers).addTo(map);
    }
  }, [showCooling, coolingCentres]);

  // Update Emergency Hospitals layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (hospitalLayerRef.current) {
      map.removeLayer(hospitalLayerRef.current);
      hospitalLayerRef.current = null;
    }

    if (showHospitals && emergencyHospitals.length > 0) {
      const validHospitals = emergencyHospitals.filter(h => 
        h && typeof h.lat === 'number' && typeof h.lng === 'number' && !isNaN(h.lat) && !isNaN(h.lng)
      );

      const markers = validHospitals.map(h => {
        try {
          const icon = L.divIcon({
            className: 'light-hospital-pin',
            html: `<div style="background-color: #DC2626; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(220,38,38,0.4); border: 2px solid white; font-size: 13px;">🏥</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });

          const m = L.marker([h.lat, h.lng], { icon });
          m.bindPopup(`
            <div style="font-family: 'Inter', sans-serif; font-size: 12px; line-height: 1.45; color: #0F172A;">
              <div style="font-weight: 700; color: #DC2626; font-size: 13px;">${h.name}</div>
              <div style="color: #64748B; font-size: 11px; margin-bottom: 4px;">${h.address}</div>
              <div><strong>Dedicated Heat Beds:</strong> ${h.heat_stroke_beds} beds</div>
              <div><strong>Emergency Ambulance:</strong> <span style="font-weight: 700; color: #DC2626;">108</span></div>
              <div><strong>Direct Desk:</strong> ${h.direct_line}</div>
            </div>
          `);
          return m;
        } catch (e) {
          console.warn("Error creating hospital marker:", e);
          return null;
        }
      }).filter(Boolean);

      hospitalLayerRef.current = L.layerGroup(markers).addTo(map);
    }
  }, [showHospitals, emergencyHospitals]);

  const handleLocateMe = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => showUserMarker(pos.coords.latitude, pos.coords.longitude, "Your Location"),
        () => showUserMarker(22.9912, 72.5850, "Danilimda (High Risk Ward Hotspot)")
      );
    } else {
      showUserMarker(22.9912, 72.5850, "Danilimda (High Risk Ward Hotspot)");
    }
  };

  const showUserMarker = (lat, lng, label) => {
    const map = mapInstanceRef.current;
    if (!map || typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return;

    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);

    const pinHtml = `
      <div style="position: relative;">
        <div style="width: 18px; height: 18px; background: #0284C7; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(2,132,199,0.5);"></div>
        <div style="position: absolute; top: -7px; left: -7px; width: 32px; height: 32px; border-radius: 50%; background: rgba(2, 132, 199, 0.3); animation: soft-pulse 1.8s infinite;"></div>
      </div>
    `;

    const icon = L.divIcon({
      className: 'user-pin-loc',
      html: pinHtml,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const marker = L.marker([lat, lng], { icon }).addTo(map);
    marker.bindPopup(`<strong style="color: #0284C7;">${label}</strong><br/>Inside Ahmedabad Monitoring Perimeter`).openPopup();
    userMarkerRef.current = marker;

    map.setView([lat, lng], 13);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '10px', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Controls */}
      <div style={{
        position: 'absolute',
        top: 14,
        left: 14,
        display: 'flex',
        gap: '8px',
        zIndex: 1000
      }}>
        <button
          onClick={handleLocateMe}
          className="btn-primary"
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          <Locate size={14} />
          <span>Locate Me</span>
        </button>

        {!compact && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '12px',
            color: '#334155',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showCooling}
                onChange={(e) => setShowCooling(e.target.checked)}
              />
              <span>Cooling Shelters (❄)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showHospitals}
                onChange={(e) => setShowHospitals(e.target.checked)}
              />
              <span>108 Hospitals (🏥)</span>
            </label>
          </div>
        )}
      </div>

      {/* Risk Legend */}
      <div style={{
        position: 'absolute',
        bottom: 14,
        right: 14,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #E2E8F0',
        padding: '10px 14px',
        borderRadius: '8px',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
          <ShieldAlert size={14} color="#DC2626" />
          <span>Risk Scale (0–100)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#16A34A', fontWeight: 700, fontSize: '11px' }}>0 Low</span>
          <div style={{
            display: 'flex',
            width: '120px',
            height: '8px',
            borderRadius: '999px',
            overflow: 'hidden'
          }}>
            <div style={{ flex: 1, backgroundColor: '#16A34A' }} />
            <div style={{ flex: 1, backgroundColor: '#D97706' }} />
            <div style={{ flex: 1, backgroundColor: '#EA580C' }} />
            <div style={{ flex: 1, backgroundColor: '#DC2626' }} />
          </div>
          <span style={{ color: '#DC2626', fontWeight: 800, fontSize: '11px' }}>100 Extreme</span>
        </div>
      </div>
    </div>
  );
}
