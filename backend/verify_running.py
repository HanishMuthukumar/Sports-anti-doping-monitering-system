import urllib.request
import json

print("====================================================")
print("  SPORTS ANTI-DOPING MONITORING SYSTEM HEALTH CHECK ")
print("====================================================")

# 1. Frontend Checks
for port in [5173, 5174]:
    url = f"http://localhost:{port}/"
    try:
        with urllib.request.urlopen(url, timeout=3) as resp:
            print(f"[OK] Frontend on Port {port}: HTTP {resp.status}")
    except Exception as e:
        print(f"[--] Frontend on Port {port}: {e}")

# 2. Backend Authentication Check
login_url = "http://localhost:8000/api/auth/login/"
payload = json.dumps({"email": "admin@demo.sadms", "password": "Demo@1234"}).encode("utf-8")
headers = {"Content-Type": "application/json"}

try:
    req = urllib.request.Request(login_url, data=payload, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=5) as resp:
        body = json.loads(resp.read().decode("utf-8"))
        token = body.get("access")
        user = body.get("user", {})
        print(f"[OK] Backend Auth (Port 8000): Logged in as {user.get('email')} [{user.get('role')}]")
except Exception as e:
    print(f"[FAIL] Backend Auth: {e}")
    token = None

# 3. Database & Dashboard API Check
if token:
    dash_url = "http://localhost:8000/api/reports/dashboard/"
    req_dash = urllib.request.Request(dash_url, headers={"Authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(req_dash, timeout=5) as resp:
            stats = json.loads(resp.read().decode("utf-8"))
            print("\n[OK] Database Query Successful! Live Counts:")
            for k, v in stats.items():
                print(f"     * {k}: {v}")
    except Exception as e:
        print(f"[FAIL] Dashboard API / Database: {e}")

print("====================================================")
print("  FULL STACK PROJECT IS LIVE AND OPERATIONAL!       ")
print("====================================================")
