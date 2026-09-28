import urllib.request
import json

def test_endpoint(url, method='GET', data=None):
    req = urllib.request.Request(url, method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
        body = json.dumps(data).encode()
    else:
        body = None
    res = urllib.request.urlopen(req, data=body)
    return json.loads(res.read().decode())

print("1. Testing /api/wards...")
wards = test_endpoint('http://localhost:5173/api/wards')
print(f"   Success: {wards['count']} wards loaded. Top: {wards['wards'][0]['name']} ({wards['wards'][0]['risk']['risk_score']} risk)")

print("2. Testing /api/city/overview...")
city = test_endpoint('http://localhost:5173/api/city/overview')
print(f"   Success: Pilot {city['pilot_city']['name']}, Extreme wards: {city['summary']['extreme_wards']}")

print("3. Testing /api/wards/ward-19 detail & ML forecast...")
w19 = test_endpoint('http://localhost:5173/api/wards/ward-19')
print(f"   Success: Ward {w19['ward']['name']}, 5-day ML horizons: {len(w19['forecast_5day'])}")

print("4. Testing POST /api/actions...")
act = test_endpoint('http://localhost:5173/api/actions', method='POST', data={
    'ward_id': 'ward-19',
    'action_type': 'cooling_centre',
    'title': 'Test Activation of Danilimda Community Centre',
    'triggered_by': 'Chief Disaster Officer',
    'notes': 'Verified automated action triggering'
})
print(f"   Success: Action ID {act['action']['id']} logged. Total actions: {act['total_actions']}")

print("5. Testing POST /api/alerts...")
alt = test_endpoint('http://localhost:5173/api/alerts', method='POST', data={
    'ward_ids': ['ward-19', 'ward-27'],
    'channel': 'WhatsApp + SMS',
    'languages': ['en', 'gu', 'hi'],
    'triggered_by': 'Disaster Control Room'
})
print(f"   Success: Alert ID {alt['alert']['id']} dispatched. Gateway: {alt['gateway_response']}")

print("6. Testing /api/methodology...")
meth = test_endpoint('http://localhost:5173/api/methodology')
print(f"   Success: {len(meth['scientific_indices'])} scientific indices, {len(meth['academic_citations'])} literature citations.")

print("7. Testing /api/asha/households...")
asha = test_endpoint('http://localhost:5173/api/asha/households')
print(f"   Success: {asha['total']} high-risk households in ASHA registry.")

print("8. Testing /api/export...")
exp = test_endpoint('http://localhost:5173/api/export')
print(f"   Success: {exp['total_wards']} wards ready for scientific export.")

print("\n>>> ALL 8 INTEGRATION TESTS PASSED 100%! FULL SYSTEM OPERATIONAL <<<")
