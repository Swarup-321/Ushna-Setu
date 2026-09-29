import mockData from './mockData.json';

// Local in-memory state for user-triggered actions & alerts during session
let localActions = [...(mockData.actions || [])];
let localAlerts = [...(mockData.alerts || [])];

export function getMockWards(tempOffset = 0, rhOffset = 0, solarOffset = 0) {
  if (tempOffset === 0 && rhOffset === 0 && solarOffset === 0) {
    return mockData.wards;
  }

  // Dynamically adjust temperatures and risk scores when what-if offsets are applied
  return mockData.wards.map(ward => {
    const adjTemp = Math.round((ward.weather.temp_c + tempOffset) * 10) / 10;
    const adjRh = Math.max(10, Math.min(95, Math.round((ward.weather.rh_pct + rhOffset) * 10) / 10));
    const adjSolar = Math.max(100, Math.round(ward.weather.solar_radiation_wm2 + solarOffset));
    
    // Approximate WBGT / Risk adjustment
    const deltaRisk = Math.round((tempOffset * 1.5 + rhOffset * 0.4 + (solarOffset / 100) * 0.5) * 10) / 10;
    const newRiskScore = Math.max(10, Math.min(99.9, Math.round((ward.risk.risk_score + deltaRisk) * 10) / 10));
    
    let severity = 'Moderate';
    let color = '#3B82F6';
    if (newRiskScore >= 75) {
      severity = 'Extreme';
      color = '#DC2626';
    } else if (newRiskScore >= 60) {
      severity = 'High';
      color = '#EA580C';
    } else if (newRiskScore >= 45) {
      severity = 'Moderate-High';
      color = '#F59E0B';
    }

    return {
      ...ward,
      weather: {
        ...ward.weather,
        temp_c: adjTemp,
        rh_pct: adjRh,
        solar_radiation_wm2: adjSolar
      },
      thermal_indices: {
        ...ward.thermal_indices,
        heat_index: {
          ...ward.thermal_indices.heat_index,
          heat_index_c: Math.round((ward.thermal_indices.heat_index.heat_index_c + tempOffset * 1.3) * 10) / 10
        },
        wbgt: {
          ...ward.thermal_indices.wbgt,
          wbgt_c: Math.round((ward.thermal_indices.wbgt.wbgt_c + tempOffset * 0.6 + rhOffset * 0.15) * 10) / 10
        }
      },
      risk: {
        ...ward.risk,
        risk_score: newRiskScore,
        severity_category: severity,
        color_hex: color
      }
    };
  });
}

export function getMockCityOverview(tempOffset = 0, rhOffset = 0, solarOffset = 0) {
  const wards = getMockWards(tempOffset, rhOffset, solarOffset);
  const extremeCount = wards.filter(w => w.risk.severity_category === 'Extreme').length;
  const highCount = wards.filter(w => w.risk.severity_category === 'High').length;
  const avgTemp = Math.round(wards.reduce((acc, w) => acc + w.weather.temp_c, 0) / wards.length * 10) / 10;

  return {
    ...mockData.city,
    current_weather: {
      ...mockData.city.current_weather,
      temp_c: Math.round((mockData.city.current_weather.temp_c + tempOffset) * 10) / 10,
      relative_humidity: Math.round((mockData.city.current_weather.relative_humidity + rhOffset) * 10) / 10,
      solar_radiation_wm2: Math.round(mockData.city.current_weather.solar_radiation_wm2 + solarOffset)
    },
    summary: {
      ...mockData.city.summary,
      extreme_wards: extremeCount,
      high_risk_wards: highCount,
      avg_temp_c: avgTemp
    }
  };
}

export function getMockWardDetail(wardId, tempOffset = 0, rhOffset = 0, solarOffset = 0) {
  const detail = mockData.ward_details[wardId];
  if (!detail) {
    const ward = getMockWards(tempOffset, rhOffset, solarOffset).find(w => w.id === wardId) || mockData.wards[0];
    return {
      ward,
      cooling_centres: mockData.city.cooling_centres || [],
      hospitals: mockData.city.hospitals || [],
      forecast_5day: []
    };
  }

  const wardWithSim = getMockWards(tempOffset, rhOffset, solarOffset).find(w => w.id === wardId) || detail.ward;

  return {
    ...detail,
    ward: wardWithSim
  };
}

export function getMockAlerts() {
  return [...localAlerts];
}

export function getMockActions() {
  return [...localActions];
}

export function getMockMethodology() {
  return mockData.methodology;
}

export function addMockAction(payload) {
  const newAction = {
    id: `act-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ward_id: payload.ward_id,
    ward_name: payload.ward_name || payload.ward_id,
    action_type: payload.action_type || 'cooling_centre',
    title: payload.title || 'Municipal Advisory Trigger',
    triggered_by: payload.triggered_by || 'Disaster Management Cell',
    notes: payload.notes || 'Automated response protocol',
    status: 'ACTIVE'
  };
  localActions.unshift(newAction);
  return { status: 'success', action: newAction, total_actions: localActions.length };
}

export function addMockAlert(payload) {
  const newAlert = {
    id: `alt-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ward_ids: payload.ward_ids || ['ward-19'],
    ward_names: payload.ward_names || ['Danilimda'],
    channel: payload.channel || 'WhatsApp + SMS',
    languages: payload.languages || ['en', 'hi', 'gu'],
    recipient_count: 14200,
    delivery_rate: '99.1%',
    message_preview: payload.custom_message || 'AMC HEATWAVE WARNING: Severe thermal stress detected. Stay indoors.',
    status: 'Delivered',
    sender: 'AMC Heat Control Room'
  };
  localAlerts.unshift(newAlert);
  return { status: 'dispatched', alert: newAlert, gateway_response: 'Mock Gateway: 14,200 SMS & WhatsApp delivered' };
}
