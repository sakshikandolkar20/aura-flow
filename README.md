<p align="center">
  <img src="https://img.shields.io/badge/AuraFlow-ICU%20Air%20Intelligence-0ea5e9?style=for-the-badge&labelColor=0a0f1e" alt="AuraFlow Badge" />
</p>

<h1 align="center">AuraFlow</h1>
<h3 align="center">AI-Powered ICU Air Quality Prediction System</h3>

<p align="center">
  <em>Predict ICU CO₂ levels <strong>before</strong> they become dangerous.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Flask-Backend-000000?style=flat-square&logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Three.js-3D-000000?style=flat-square&logo=three.js&logoColor=white" />
  <img src="https://img.shields.io/badge/scikit--learn-ML-F7931E?style=flat-square&logo=scikitlearn&logoColor=white" />
</p>

---

## What is AuraFlow?

**AuraFlow** is a full-stack machine learning application that predicts CO₂ concentration levels in ICU (Intensive Care Unit) environments. It uses real-time environmental parameters — occupancy, ventilation, temperature, humidity, and time — to forecast air quality and classify risk levels, helping healthcare professionals act *before* conditions become unsafe.

### Why does this matter?

Sealed ICU rooms save lives by preventing contamination, but they also trap CO₂. High CO₂ levels impair cognitive function, patient recovery, and staff alertness — yet there's rarely any proactive monitoring. AuraFlow fills this gap with **predictive intelligence**.

---

## Features

| Feature | Description |
|---------|-------------|
| **ML Prediction Engine** | Linear Regression model trained on ICU environmental data |
| **Real-Time Forecasting** | Sub-second predictions from 6 input parameters |
| **Risk Classification** | Auto-labels results as **Optimal** (< 600 ppm), **Acceptable** (600–800 ppm), or **High** (> 800 ppm) |
| **Actionable Recommendations** | Context-aware suggestions based on prediction severity |
| **Interactive Dashboard** | Glassmorphic UI with live charts and animated results |
| **3D Hero Section** | Three.js particle field with floating wireframe sphere |
| **Visual Analytics** | CO₂ trend lines, predicted vs. safe threshold areas, parameter impact bars |
| **Prediction History** | Charts dynamically update as you make multiple predictions |
| **Responsive Design** | Works on desktop, tablet, and mobile |

---

## Tech Stack

### Backend (Python)

| Technology | Purpose |
|------------|---------|
| **Flask** | REST API server |
| **Flask-CORS** | Cross-origin support for React frontend |
| **scikit-learn** | Machine learning model (Linear Regression) |
| **NumPy** | Numerical computations |
| **Pandas** | Data loading and preprocessing |
| **Joblib** | Model serialization (.pkl) |

### Frontend (JavaScript)

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **Vite 8** | Build tool and dev server |
| **Tailwind CSS 3.4** | Utility-first styling |
| **Framer Motion** | Animations and scroll effects |
| **Recharts** | Data visualization (line, area, bar charts) |
| **Three.js** | 3D graphics (via @react-three/fiber + drei) |
| **React Router** | Client-side routing |

---

## Project Structure

```
aura-farm/
├── app.py                     # Flask API server (main backend)
├── save_model.py              # Model training & serialization
├── co2_model.pkl              # Trained ML model (auto-generated)
├── icu_co2_data.csv           # Training dataset
├── co2_prediction_pipeline.py # Extended ML pipeline
├── requirements.txt           # Python dependencies
│
├── frontend/                  # React application
│   ├── index.html             # HTML entry point
│   ├── package.json           # Node.js dependencies
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── vite.config.js         # Vite configuration
│   └── src/
│       ├── main.jsx           # React entry point
│       ├── App.jsx            # Router setup (lazy-loaded pages)
│       ├── index.css          # Global design system (glassmorphism)
│       ├── components/
│       │   ├── Hero3D.jsx     # Hero section (image + 3D + animations)
│       │   ├── HeroCanvas.jsx # Three.js canvas (particles + sphere)
│       │   └── Charts.jsx     # Recharts components (3 chart types)
│       ├── pages/
│       │   ├── LandingPage.jsx # Landing page with scroll sections
│       │   └── Dashboard.jsx   # Prediction form + results + charts
│       └── assets/
│           └── icu-hero-bg.png # Hero background image
│
├── test_api.py                # API endpoint tests
├── test_model.py              # Model accuracy tests
└── quick_test.py              # Quick validation script
```

---

## Quick Start

### Prerequisites

- **Python 3.10+** installed
- **Node.js 18+** and **npm** installed
- **Git** (optional, for cloning)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/aura-farm.git
cd aura-farm
```

### 2. Set up the backend

```bash
# Create virtual environment
python -m venv .venv

# Activate it
# Windows:
.\.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Set up the frontend

```bash
cd frontend
npm install
cd ..
```

### 4. Run both servers

**Terminal 1 — Backend:**
```bash
# From project root (aura-farm/)
python app.py
# → Running on http://127.0.0.1:5000
```

**Terminal 2 — Frontend:**
```bash
# From frontend/ directory
cd frontend
npm run dev
# → Running on http://localhost:5173
```

### 5. Open the app

Navigate to **http://localhost:5173** in your browser.

---

## API Reference

### `POST /predict`

Predict CO₂ concentration from ICU environmental parameters.

**Request:**
```json
{
  "time_min": 30,
  "occupancy": 5,
  "ventilation_efficiency": 0.7,
  "ventilation_rate": 8,
  "temperature_c": 22,
  "humidity_pct": 50
}
```

**Response:**
```json
{
  "predicted_co2": 590.08,
  "status": "Optimal"
}
```

**Status values:**
| Status | CO₂ Range | Meaning |
|--------|-----------|---------|
| `Optimal` | < 600 ppm | Safe — maintain current settings |
| `Acceptable` | 600–800 ppm | Caution — consider increasing ventilation |
| `High` | > 800 ppm | Action required — alert clinical team |

### `GET /health`

Health check endpoint.

```json
{ "status": "Backend running" }
```

### `POST /predict_batch`

Batch predictions for multiple data points. Send an array of parameter objects.

---

## How the ML Model Works

1. **Dataset** — `icu_co2_data.csv` contains environmental readings with corresponding CO₂ measurements
2. **Features** — 6 input variables: `time_min`, `occupancy`, `ventilation_efficiency`, `ventilation_rate`, `temperature_c`, `humidity_pct`
3. **Algorithm** — Linear Regression (via scikit-learn)
4. **Training** — `save_model.py` trains the model and serializes it to `co2_model.pkl`
5. **Inference** — `app.py` loads the model at startup and serves predictions via the `/predict` endpoint

To retrain the model:
```bash
python save_model.py
```

---

## UI Design

The interface features a **futuristic healthcare AI aesthetic** with:

- **Glassmorphism** — Semi-transparent cards with backdrop blur and gradient borders
- **3D Graphics** — Wireframe sphere, particle field, and orbital rings (Three.js)
- **Micro-animations** — Staggered fade-ins, hover lift effects, glow pulses (Framer Motion)
- **Dark theme** — Deep navy palette (`#0a0f1e`) with sky-blue and teal accents
- **DM Sans** typography — Clean, modern font from Google Fonts

---

## Testing

```bash
# Test the ML model
python test_model.py

# Test the API endpoints
python test_api.py

# Quick smoke test
python quick_test.py
```

Or test the API manually with curl:
```bash
curl -X POST http://127.0.0.1:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"time_min":30,"occupancy":5,"ventilation_efficiency":0.7,"ventilation_rate":8,"temperature_c":22,"humidity_pct":50}'
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Failed to fetch` in frontend | Make sure the Flask backend is running on port 5000 |
| CORS errors | `flask-cors` is installed and CORS is enabled in `app.py` |
| Model not loading | Run `python save_model.py` to regenerate `co2_model.pkl` |
| Port 5173 in use | Vite will auto-select the next available port |
| `UnicodeEncodeError` on Windows | Already handled — emoji-free console output |

---

## License

This project is for educational and research purposes.

---

<p align="center">
  <strong>Built for safer ICU environments</strong><br/>
  <sub>AuraFlow — AI-Powered Air Quality Intelligence</sub>
</p>
