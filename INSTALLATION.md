# AuraFlow — Installation & Requirements Guide

Complete guide for installing **all dependencies** needed to run AuraFlow.

---

## System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **Operating System** | Windows 10 / macOS 12 / Ubuntu 20.04 | Windows 11 / macOS 14 / Ubuntu 22.04 |
| **Python** | 3.10 | 3.12+ |
| **Node.js** | 18.x | 20.x or 22.x |
| **npm** | 9.x | 10.x |
| **RAM** | 4 GB | 8 GB |
| **Disk Space** | 500 MB | 1 GB |

---

## 1. Python Dependencies (Backend)

These packages power the Flask API and ML model.

### Install all at once

```bash
pip install -r requirements.txt
```

### What's in `requirements.txt`

| Package | Version | Purpose |
|---------|---------|---------|
| `flask` | Latest | Web server / REST API framework |
| `flask-cors` | Latest | Cross-Origin Resource Sharing (lets React talk to Flask) |
| `numpy` | Latest | Numerical arrays for ML model input |
| `pandas` | Latest | CSV data loading and DataFrame operations |
| `scikit-learn` | Latest | Machine learning (Linear Regression model) |
| `joblib` | Latest | Model serialization — save/load `.pkl` files |
| `requests` | Latest | HTTP client for API testing scripts |

### Manual install (if requirements.txt fails)

```bash
pip install flask flask-cors numpy pandas scikit-learn joblib requests
```

### Verify Python packages

```bash
python -c "import flask; import flask_cors; import numpy; import pandas; import sklearn; import joblib; print('All Python packages OK')"
```

---

## 2. Node.js Dependencies (Frontend)

These packages power the React UI, 3D graphics, charts, and animations.

### Install all at once

```bash
cd frontend
npm install
```

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.2.5 | Core UI framework |
| `react-dom` | ^19.2.5 | React DOM renderer |
| `react-router-dom` | ^7.14.2 | Client-side routing (`/` and `/dashboard`) |
| `framer-motion` | ^12.38.0 | Animations — scroll reveals, hover effects, transitions |
| `recharts` | ^3.8.1 | Data visualization — line, area, and bar charts |
| `three` | ^0.184.0 | 3D graphics engine |
| `@react-three/fiber` | ^9.6.0 | React renderer for Three.js |
| `@react-three/drei` | ^10.7.7 | Three.js helpers (Float, Sphere, MeshDistortMaterial) |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^8.0.10 | Build tool and lightning-fast dev server |
| `@vitejs/plugin-react` | ^6.0.1 | React Fast Refresh for Vite |
| `tailwindcss` | ^3.4.19 | Utility-first CSS framework |
| `postcss` | ^8.5.10 | CSS post-processing (required by Tailwind) |
| `autoprefixer` | ^10.5.0 | Auto vendor-prefixing (required by Tailwind) |
| `eslint` | ^10.2.1 | Code linter |
| `@eslint/js` | ^10.0.1 | ESLint JavaScript config |
| `eslint-plugin-react-hooks` | ^7.1.1 | React hooks linting rules |
| `eslint-plugin-react-refresh` | ^0.5.2 | Fast Refresh linting |
| `globals` | ^17.5.0 | Global variables for ESLint |
| `@types/react` | ^19.2.14 | TypeScript types (for IDE support) |
| `@types/react-dom` | ^19.2.3 | TypeScript types (for IDE support) |

### Manual install (if npm install fails)

```bash
cd frontend
npm install react react-dom react-router-dom framer-motion recharts three @react-three/fiber @react-three/drei
npm install -D vite @vitejs/plugin-react tailwindcss postcss autoprefixer eslint
```

---

## 3. Step-by-Step Setup

### Option A: Fresh setup from scratch

```bash
# 1. Clone the repo
git clone https://github.com/your-username/aura-farm.git
cd aura-farm

# 2. Create Python virtual environment
python -m venv .venv

# 3. Activate it
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Windows CMD:
.\.venv\Scripts\activate.bat
# macOS / Linux:
source .venv/bin/activate

# 4. Install Python dependencies
pip install -r requirements.txt

# 5. Build the ML model (generates co2_model.pkl)
python save_model.py

# 6. Install frontend dependencies
cd frontend
npm install
cd ..
```

### Option B: If you already have the code

```bash
# Just install/update dependencies
pip install -r requirements.txt
cd frontend && npm install && cd ..
```

---

## 4. Running the Application

You need **two terminals** running simultaneously:

### Terminal 1 — Flask Backend

```bash
# From project root (aura-farm/)
# Activate venv first if not already active
.\.venv\Scripts\activate        # Windows
source .venv/bin/activate       # macOS/Linux

python app.py
```

Expected output:
```
[OK] Model loaded successfully from co2_model.pkl
==================================================
AuraFlow Backend starting...
  -> http://127.0.0.1:5000
  -> POST /predict  (single prediction)
  -> GET  /health   (health check)
==================================================
 * Running on http://127.0.0.1:5000
```

### Terminal 2 — React Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v8.0.10  ready in 1500 ms
  ➜  Local:   http://localhost:5173/
```

### Open the app

Go to **http://localhost:5173** in your browser.

---

## 5. Verifying Everything Works

### Check the backend

```bash
curl http://127.0.0.1:5000/health
# Should return: {"status":"Backend running"}
```

### Check the ML model

```bash
python -c "import joblib; m=joblib.load('co2_model.pkl'); print('Model OK:', type(m).__name__)"
# Should return: Model OK: LinearRegression
```

### Check the frontend

Open http://localhost:5173 in your browser — you should see the AuraFlow landing page with a 3D hero section.

### Test a prediction

```bash
curl -X POST http://127.0.0.1:5000/predict -H "Content-Type: application/json" -d "{\"time_min\":30,\"occupancy\":5,\"ventilation_efficiency\":0.7,\"ventilation_rate\":8,\"temperature_c\":22,\"humidity_pct\":50}"
```

Expected:
```json
{"predicted_co2": 590.08, "status": "Optimal"}
```

---

## 6. Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `python` not found | Use `python3` instead, or add Python to your PATH |
| `pip` not found | Use `python -m pip install -r requirements.txt` |
| `npm` not found | Install Node.js from https://nodejs.org |
| `venv` activation fails (PowerShell) | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` first |
| Port 5000 in use | Kill the process using port 5000, or change the port in `app.py` |
| Port 5173 in use | Vite will auto-select the next available port (5174, 5175, ...) |
| `ModuleNotFoundError` in Python | Make sure your venv is activated before running |
| `co2_model.pkl` missing or corrupt | Run `python save_model.py` to rebuild |
| CORS error in browser console | Ensure `flask-cors` is installed: `pip install flask-cors` |
| Blank white page in browser | Check the browser console (F12) for JS errors |

---

## 7. Production Build (Optional)

To create a minified production build of the frontend:

```bash
cd frontend
npm run build
```

The output will be in `frontend/dist/`. You can serve it with any static file server.

---

<p align="center">
  <sub>AuraFlow — All dependencies documented for a smooth setup experience.</sub>
</p>
