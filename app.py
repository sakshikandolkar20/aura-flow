from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import logging
import sys
import io
from pathlib import Path

from save_model import build_and_save_model

# Fix Windows console encoding for Unicode output
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding != 'utf-8':
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins (React on :5173)

# Logging setup
logging.basicConfig(level=logging.INFO)

def load_model():
    """Load the most recent .pkl model, or rebuild if none found."""
    model_candidates = sorted(
        Path(".").glob("co2_model*.pkl"),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )

    for model_file in model_candidates:
        try:
            logging.info(f"Loading model: {model_file}")
            m = joblib.load(model_file)
            print(f"[OK] Model loaded successfully from {model_file}")
            return m
        except Exception as error:
            logging.warning(f"Failed to load {model_file}: {error}")

    logging.warning("No loadable model found, rebuilding model...")
    m = build_and_save_model()
    print("[OK] Model rebuilt and loaded successfully")
    return m


model = load_model()

# -------------------------------
# HOME ROUTE
# -------------------------------
@app.route("/")
def home():
    return "CO2 Backend Running"

# -------------------------------
# HEALTH CHECK
# -------------------------------
@app.route("/health")
def health():
    return jsonify({"status": "Backend running"})

# -------------------------------
# SINGLE PREDICTION
# -------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)
        logging.info(f"Received prediction request: {data}")

        required_fields = [
            'time_min', 'occupancy', 'ventilation_efficiency',
            'ventilation_rate', 'temperature_c', 'humidity_pct'
        ]

        # Validation
        for field in required_fields:
            if field not in data:
                logging.error(f"Missing field: {field}")
                return jsonify({"error": f"{field} missing"}), 400

        # Convert input to array (explicit float cast)
        features = np.array([[float(data[f]) for f in required_fields]])

        # Prediction
        prediction = model.predict(features)[0]

        # Status logic
        if prediction < 600:
            status = "Optimal"
        elif prediction < 800:
            status = "Acceptable"
        else:
            status = "High"

        result = {
            "predicted_co2": round(float(prediction), 2),
            "status": status
        }

        logging.info(f"Prediction result: {result}")
        return jsonify(result)

    except Exception as e:
        logging.error(f"Prediction error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# -------------------------------
# BATCH PREDICTION
# -------------------------------
@app.route("/predict_batch", methods=["POST"])
def predict_batch():
    try:
        data = request.get_json(force=True)

        features = np.array([
            [
                d['time_min'],
                d['occupancy'],
                d['ventilation_efficiency'],
                d['ventilation_rate'],
                d['temperature_c'],
                d['humidity_pct']
            ]
            for d in data
        ])

        preds = model.predict(features)

        return jsonify(preds.tolist())

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------------
# RUN SERVER
# -------------------------------
if __name__ == "__main__":
    print("=" * 50)
    print("AuraFlow Backend starting...")
    print("  -> http://127.0.0.1:5000")
    print("  -> POST /predict  (single prediction)")
    print("  -> GET  /health   (health check)")
    print("=" * 50)
    app.run(host="127.0.0.1", port=5000, debug=True)
