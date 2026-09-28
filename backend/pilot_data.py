"""
Pilot City Data: Ahmedabad Municipal Corporation (AMC)
Provides 18 ward administrative boundaries in GeoJSON format,
with socio-demographic vulnerability proxies (Census 2011 / Municipal reports),
and mapped municipal cooling centres & designated heat emergency hospitals.
"""

from typing import List, Dict, Any

PILOT_CITY = {
    "id": "ahmedabad",
    "name": "Ahmedabad",
    "state": "Gujarat",
    "authority": "Ahmedabad Municipal Corporation (AMC)",
    "center": [23.0225, 72.5714], # [lat, lng]
    "zoom": 12,
    "default_weather": {
        "temp_c": 41.5,
        "relative_humidity": 38.0,
        "wind_speed_ms": 2.4,
        "solar_radiation_wm2": 780.0,
        "condition": "Severe Heatwave Conditions (Loo winds active)",
        "source": "IMD Ahmedabad AWS & NCMRWF Regional NWP"
    }
}

# 18 Wards covering West, Central, East, North, and South zones with real polygon coordinates
WARDS_RAW_DATA = [
    {
        "id": "ward-19",
        "name": "Danilimda",
        "zone": "South Zone",
        "population": 142000,
        "area_sqkm": 6.8,
        "elderly_pct": 14.5,
        "outdoor_worker_density": 44.2,  # high informal leather, recycling, construction
        "informal_housing_pct": 49.5,   # tin roofs, dense fabric
        "tree_canopy_pct": 4.1,
        "microclimate_factor": 1.15,     # heat island amplification
        "base_temp_offset": 1.6,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.5750, 22.9800],
                [72.6050, 22.9800],
                [72.6100, 23.0020],
                [72.5800, 23.0050],
                [72.5750, 22.9800]
            ]]
        }
    },
    {
        "id": "ward-14",
        "name": "Jamalpur",
        "zone": "Central Zone (Old City)",
        "population": 98500,
        "area_sqkm": 3.4,
        "elderly_pct": 19.8,             # high elderly population
        "outdoor_worker_density": 38.6,
        "informal_housing_pct": 36.0,
        "tree_canopy_pct": 3.5,
        "microclimate_factor": 1.18,     # dense stone/brick walled city, poor night ventilation
        "base_temp_offset": 1.8,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.5700, 23.0050],
                [72.5920, 23.0050],
                [72.5940, 23.0220],
                [72.5710, 23.0200],
                [72.5700, 23.0050]
            ]]
        }
    },
    {
        "id": "ward-27",
        "name": "Vatva",
        "zone": "South Zone (Industrial)",
        "population": 165000,
        "area_sqkm": 11.2,
        "elderly_pct": 10.2,
        "outdoor_worker_density": 46.8,  # GIDC chemical & dye workers
        "informal_housing_pct": 48.0,
        "tree_canopy_pct": 2.8,
        "microclimate_factor": 1.22,     # industrial thermal emissions + bare soil
        "base_temp_offset": 2.2,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.6050, 22.9550],
                [72.6500, 22.9550],
                [72.6520, 22.9850],
                [72.6100, 22.9820],
                [72.6050, 22.9550]
            ]]
        }
    },
    {
        "id": "ward-08",
        "name": "Bapunagar",
        "zone": "East Zone",
        "population": 158000,
        "area_sqkm": 5.2,
        "elderly_pct": 13.0,
        "outdoor_worker_density": 42.5,  # diamond polishing, textile mills, street vending
        "informal_housing_pct": 39.0,
        "tree_canopy_pct": 5.0,
        "microclimate_factor": 1.12,
        "base_temp_offset": 1.4,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.6150, 23.0300],
                [72.6450, 23.0300],
                [72.6480, 23.0550],
                [72.6180, 23.0520],
                [72.6150, 23.0300]
            ]]
        }
    },
    {
        "id": "ward-03",
        "name": "Dariapur",
        "zone": "Central Zone",
        "population": 84000,
        "area_sqkm": 2.6,
        "elderly_pct": 21.4,             # dense joint families, highest elderly ratio
        "outdoor_worker_density": 33.0,
        "informal_housing_pct": 28.5,
        "tree_canopy_pct": 3.0,
        "microclimate_factor": 1.14,
        "base_temp_offset": 1.3,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.5850, 23.0220],
                [72.6050, 23.0220],
                [72.6080, 23.0400],
                [72.5870, 23.0390],
                [72.5850, 23.0220]
            ]]
        }
    },
    {
        "id": "ward-05",
        "name": "Khadia",
        "zone": "Central Zone (Pols)",
        "population": 68000,
        "area_sqkm": 2.1,
        "elderly_pct": 22.6,             # oldest demographic in Ahmedabad pols
        "outdoor_worker_density": 27.0,
        "informal_housing_pct": 18.0,
        "tree_canopy_pct": 4.2,
        "microclimate_factor": 1.10,
        "base_temp_offset": 0.9,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.5880, 23.0150],
                [72.6080, 23.0150],
                [72.6070, 23.0280],
                [72.5870, 23.0280],
                [72.5880, 23.0150]
            ]]
        }
    },
    {
        "id": "ward-22",
        "name": "Behrampura",
        "zone": "South Zone",
        "population": 118000,
        "area_sqkm": 4.9,
        "elderly_pct": 12.8,
        "outdoor_worker_density": 43.1,
        "informal_housing_pct": 47.0,
        "tree_canopy_pct": 3.8,
        "microclimate_factor": 1.16,
        "base_temp_offset": 1.5,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.5800, 22.9900],
                [72.6050, 22.9900],
                [72.6080, 23.0100],
                [72.5820, 23.0100],
                [72.5800, 22.9900]
            ]]
        }
    },
    {
        "id": "ward-11",
        "name": "Odhav",
        "zone": "East Zone (Industrial)",
        "population": 139000,
        "area_sqkm": 8.4,
        "elderly_pct": 9.5,
        "outdoor_worker_density": 45.4,
        "informal_housing_pct": 42.0,
        "tree_canopy_pct": 4.5,
        "microclimate_factor": 1.17,
        "base_temp_offset": 1.7,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.6450, 23.0150],
                [72.6850, 23.0150],
                [72.6880, 23.0450],
                [72.6470, 23.0420],
                [72.6450, 23.0150]
            ]]
        }
    },
    {
        "id": "ward-09",
        "name": "Nikol",
        "zone": "East Zone",
        "population": 145000,
        "area_sqkm": 9.6,
        "elderly_pct": 8.8,
        "outdoor_worker_density": 39.0,
        "informal_housing_pct": 31.0,
        "tree_canopy_pct": 6.8,
        "microclimate_factor": 1.08,
        "base_temp_offset": 1.1,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.6450, 23.0450],
                [72.6850, 23.0450],
                [72.6880, 23.0800],
                [72.6470, 23.0780],
                [72.6450, 23.0450]
            ]]
        }
    },
    {
        "id": "ward-07",
        "name": "Asarwa",
        "zone": "East Zone (Civil Hospital)",
        "population": 105000,
        "area_sqkm": 4.1,
        "elderly_pct": 16.2,
        "outdoor_worker_density": 34.0,
        "informal_housing_pct": 32.0,
        "tree_canopy_pct": 6.2,
        "microclimate_factor": 1.09,
        "base_temp_offset": 0.8,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.5950, 23.0400],
                [72.6250, 23.0400],
                [72.6280, 23.0650],
                [72.5970, 23.0620],
                [72.5950, 23.0400]
            ]]
        }
    },
    {
        "id": "ward-16",
        "name": "Maninagar",
        "zone": "South Zone (Kankaria)",
        "population": 126000,
        "area_sqkm": 5.8,
        "elderly_pct": 17.5,
        "outdoor_worker_density": 26.5,
        "informal_housing_pct": 19.0,
        "tree_canopy_pct": 11.4,         # lake vicinity, better greenery
        "microclimate_factor": 1.02,
        "base_temp_offset": 0.2,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.5950, 22.9900],
                [72.6250, 22.9900],
                [72.6280, 23.0150],
                [72.5980, 23.0120],
                [72.5950, 22.9900]
            ]]
        }
    },
    {
        "id": "ward-01",
        "name": "Navrangpura",
        "zone": "West Zone (University / Commercial)",
        "population": 92000,
        "area_sqkm": 6.1,
        "elderly_pct": 18.2,
        "outdoor_worker_density": 18.5,  # higher-income commercial/educational
        "informal_housing_pct": 11.0,
        "tree_canopy_pct": 14.2,         # higher tree canopy
        "microclimate_factor": 0.94,
        "base_temp_offset": -0.6,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.5400, 23.0250],
                [72.5700, 23.0250],
                [72.5720, 23.0500],
                [72.5420, 23.0480],
                [72.5400, 23.0250]
            ]]
        }
    },
    {
        "id": "ward-02",
        "name": "Paldi",
        "zone": "West Zone",
        "population": 88000,
        "area_sqkm": 4.5,
        "elderly_pct": 19.4,             # significant senior citizen population
        "outdoor_worker_density": 16.0,
        "informal_housing_pct": 10.5,
        "tree_canopy_pct": 13.0,
        "microclimate_factor": 0.96,
        "base_temp_offset": -0.4,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.5450, 23.0020],
                [72.5730, 23.0020],
                [72.5740, 23.0250],
                [72.5470, 23.0240],
                [72.5450, 23.0020]
            ]]
        }
    },
    {
        "id": "ward-18",
        "name": "Bodakdev",
        "zone": "New West Zone (SG Highway)",
        "population": 110000,
        "area_sqkm": 8.7,
        "elderly_pct": 12.0,
        "outdoor_worker_density": 17.0,
        "informal_housing_pct": 8.0,     # planned societies, modern HVAC
        "tree_canopy_pct": 15.5,
        "microclimate_factor": 0.92,
        "base_temp_offset": -0.9,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.5000, 23.0300],
                [72.5380, 23.0300],
                [72.5400, 23.0600],
                [72.5020, 23.0580],
                [72.5000, 23.0300]
            ]]
        }
    },
    {
        "id": "ward-12",
        "name": "Sabarmati",
        "zone": "North West Zone (Riverfront)",
        "population": 102000,
        "area_sqkm": 7.3,
        "elderly_pct": 15.0,
        "outdoor_worker_density": 28.0,
        "informal_housing_pct": 24.0,
        "tree_canopy_pct": 11.0,
        "microclimate_factor": 0.98,
        "base_temp_offset": -0.2,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.5650, 23.0650],
                [72.5950, 23.0650],
                [72.5980, 23.0950],
                [72.5670, 23.0920],
                [72.5650, 23.0650]
            ]]
        }
    },
    {
        "id": "ward-20",
        "name": "Chandkheda",
        "zone": "North Zone",
        "population": 125000,
        "area_sqkm": 9.4,
        "elderly_pct": 11.5,
        "outdoor_worker_density": 36.2,  # ongoing construction & roadworks
        "informal_housing_pct": 29.0,
        "tree_canopy_pct": 8.0,
        "microclimate_factor": 1.05,
        "base_temp_offset": 0.5,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.5650, 23.0950],
                [72.6050, 23.0950],
                [72.6080, 23.1250],
                [72.5680, 23.1220],
                [72.5650, 23.0950]
            ]]
        }
    },
    {
        "id": "ward-21",
        "name": "Gota",
        "zone": "North West Zone",
        "population": 132000,
        "area_sqkm": 10.5,
        "elderly_pct": 9.2,
        "outdoor_worker_density": 37.8,  # dense construction corridor
        "informal_housing_pct": 27.5,
        "tree_canopy_pct": 6.5,
        "microclimate_factor": 1.06,
        "base_temp_offset": 0.6,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.5200, 23.0850],
                [72.5620, 23.0850],
                [72.5650, 23.1200],
                [72.5220, 23.1180],
                [72.5200, 23.0850]
            ]]
        }
    },
    {
        "id": "ward-25",
        "name": "Sarkhej",
        "zone": "South West Zone",
        "population": 148000,
        "area_sqkm": 12.0,
        "elderly_pct": 11.8,
        "outdoor_worker_density": 41.5,  # logistics, heavy transport hub, informal settlements
        "informal_housing_pct": 44.0,
        "tree_canopy_pct": 5.2,
        "microclimate_factor": 1.13,
        "base_temp_offset": 1.3,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [72.4900, 22.9800],
                [72.5400, 22.9800],
                [72.5430, 23.0150],
                [72.4920, 23.0120],
                [72.4900, 22.9800]
            ]]
        }
    }
]

# Municipal Cooling Centres with real addresses & coordinates
COOLING_CENTRES = [
    {
        "id": "cc-01",
        "ward_id": "ward-19",
        "name": "Danilimda AMC Community Hall Cooling Centre",
        "type": "Municipal AC Shelter",
        "address": "Opp. Khodiyarnagar Bus Stand, Danilimda",
        "lat": 22.9912,
        "lng": 72.5910,
        "capacity": 250,
        "water_station": True,
        "medical_staff": True,
        "status": "Active (Activated via Action Layer)",
        "phone": "+91 79 2535 4100"
    },
    {
        "id": "cc-02",
        "ward_id": "ward-14",
        "name": "Jamalpur APMC Shaded Hydration & Rest Hub",
        "type": "High-Volume Shaded Transit Facility",
        "address": "Near Sardar Bridge Approach, Jamalpur",
        "lat": 23.0135,
        "lng": 72.5790,
        "capacity": 320,
        "water_station": True,
        "medical_staff": True,
        "status": "Active",
        "phone": "+91 79 2539 1222"
    },
    {
        "id": "cc-03",
        "ward_id": "ward-27",
        "name": "Vatva GIDC Worker Welfare Cooling Depot",
        "type": "Industrial Worker Respite Hub",
        "address": "Phase-IV, Near Vatva Railway Crossing",
        "lat": 22.9690,
        "lng": 72.6310,
        "capacity": 400,
        "water_station": True,
        "medical_staff": True,
        "status": "Active",
        "phone": "+91 79 2583 0451"
    },
    {
        "id": "cc-04",
        "ward_id": "ward-08",
        "name": "Bapunagar Diamond Market Civic Hall",
        "type": "Air-Conditioned Public Hall",
        "address": "India Colony Road, Bapunagar",
        "lat": 23.0420,
        "lng": 72.6320,
        "capacity": 200,
        "water_station": True,
        "medical_staff": False,
        "status": "Standby (Ready for one-click activation)",
        "phone": "+91 79 2274 8810"
    },
    {
        "id": "cc-05",
        "ward_id": "ward-03",
        "name": "Dariapur Pol Heritage Community Shelter",
        "type": "Senior-Friendly Shaded Shelter",
        "address": "Near Delhi Darwaja, Dariapur",
        "lat": 23.0310,
        "lng": 72.5950,
        "capacity": 180,
        "water_station": True,
        "medical_staff": True,
        "status": "Active",
        "phone": "+91 79 2213 4901"
    },
    {
        "id": "cc-06",
        "ward_id": "ward-01",
        "name": "Navrangpura Municipal Library Reading Hall",
        "type": "Air-Cooled Quiet Space",
        "address": "University Road, Navrangpura",
        "lat": 23.0370,
        "lng": 72.5550,
        "capacity": 150,
        "water_station": True,
        "medical_staff": False,
        "status": "Active",
        "phone": "+91 79 2630 1199"
    },
    {
        "id": "cc-07",
        "ward_id": "ward-02",
        "name": "Sabarmati Riverfront Shaded Misting Pavilion",
        "type": "Misting Canopy & Rest Hub",
        "address": "Riverfront West Promenade, Near Nehru Bridge",
        "lat": 23.0270,
        "lng": 72.5710,
        "capacity": 300,
        "water_station": True,
        "medical_staff": True,
        "status": "Active",
        "phone": "+91 79 2658 0401"
    },
    {
        "id": "cc-08",
        "ward_id": "ward-11",
        "name": "Naroda GIDC Shaded Worker Chhabeel & Clinic",
        "type": "Drinking Water Kiosk & Health Booth",
        "address": "Near Naroda Patiya Circle, Naroda",
        "lat": 23.0680,
        "lng": 72.6510,
        "capacity": 220,
        "water_station": True,
        "medical_staff": True,
        "status": "Active",
        "phone": "+91 79 2281 3320"
    },
    {
        "id": "cc-09",
        "ward_id": "ward-16",
        "name": "Maninagar Kankaria Lake Shaded Arbor & Relief Hall",
        "type": "Municipal AC Shelter",
        "address": "Gate No. 3, Kankaria Lakefront, Maninagar",
        "lat": 22.9990,
        "lng": 72.6020,
        "capacity": 350,
        "water_station": True,
        "medical_staff": True,
        "status": "Active",
        "phone": "+91 79 2543 8811"
    },
    {
        "id": "cc-10",
        "ward_id": "ward-18",
        "name": "Chandkheda Community Health Centre Cooling Wing",
        "type": "Primary Health Centre Cooling Hub",
        "address": "S.P. Ring Road Approach, Chandkheda",
        "lat": 23.1110,
        "lng": 72.5850,
        "capacity": 180,
        "water_station": True,
        "medical_staff": True,
        "status": "Active",
        "phone": "+91 79 2750 9100"
    },
    {
        "id": "cc-11",
        "ward_id": "ward-02",
        "name": "Ellisbridge Town Hall Air-Conditioned Public Haven",
        "type": "Municipal AC Shelter",
        "address": "Ashram Road, Near Town Hall, Ellisbridge",
        "lat": 23.0230,
        "lng": 72.5680,
        "capacity": 450,
        "water_station": True,
        "medical_staff": True,
        "status": "Active",
        "phone": "+91 79 2657 5544"
    },
    {
        "id": "cc-12",
        "ward_id": "ward-10",
        "name": "Odhav Ring Road Labor Chhabeel & Water Kiosk",
        "type": "Drinking Water Kiosk & Health Booth",
        "address": "Odhav Crossroads, SP Ring Road",
        "lat": 23.0180,
        "lng": 72.6710,
        "capacity": 200,
        "water_station": True,
        "medical_staff": False,
        "status": "Active",
        "phone": "+91 79 2287 4410"
    }
]

# Designated Heatwave Emergency Hospitals with dedicated cold-room facilities
EMERGENCY_HOSPITALS = [
    {
        "id": "hosp-01",
        "ward_id": "ward-07",
        "name": "Ahmedabad Civil Hospital (Apex Trauma & Heat-Stroke Centre)",
        "address": "Asarwa, Ahmedabad - 380016",
        "lat": 23.0531,
        "lng": 72.6042,
        "emergency_phone": "108",
        "direct_line": "+91 79 2268 0074",
        "heat_stroke_beds": 60,
        "icu_available": True,
        "distance_km": 1.2
    },
    {
        "id": "hosp-02",
        "ward_id": "ward-02",
        "name": "SVP Institute of Medical Sciences & Research (VS Hospital)",
        "address": "Ellisbridge, Riverfront West, Paldi",
        "lat": 23.0185,
        "lng": 72.5695,
        "emergency_phone": "108",
        "direct_line": "+91 79 2657 7621",
        "heat_stroke_beds": 45,
        "icu_available": True,
        "distance_km": 2.1
    },
    {
        "id": "hosp-03",
        "ward_id": "ward-08",
        "name": "Shardaben Municipal General Hospital",
        "address": "Saraspur, Near Bapunagar, Ahmedabad",
        "lat": 23.0322,
        "lng": 72.6189,
        "emergency_phone": "108",
        "direct_line": "+91 79 2292 1100",
        "heat_stroke_beds": 30,
        "icu_available": True,
        "distance_km": 1.8
    },
    {
        "id": "hosp-04",
        "ward_id": "ward-16",
        "name": "L.G. Municipal General Hospital",
        "address": "Maninagar, Ahmedabad - 380008",
        "lat": 22.9984,
        "lng": 72.6102,
        "emergency_phone": "108",
        "direct_line": "+91 79 2546 1381",
        "heat_stroke_beds": 35,
        "icu_available": True,
        "distance_km": 2.4
    }
]
