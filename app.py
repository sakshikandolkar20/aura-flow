from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import logging
from pathlib import Path

from save_model import build_and_save_model

app = Flask(__name__)
CORS(app)   # ✅ allow React to connect

# Logging setup
logging.basicConfig(level=logging.INFO)

def load_model():
    model_candidates = sorted(
        Path(".").glob("co2_model*.pkl"),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )

    for model_file in model_candidates:
        try:
            logging.info(f"Loading model: {model_file}")
            return joblib.load(model_file)
        except Exception as error:
            logging.warning(f"Failed to load {model_file}: {error}")

    logging.warning("No loadable model found, rebuilding model...")
    return build_and_save_model()


model = load_model()

# -------------------------------
# ✅ HOME ROUTE
# -------------------------------
@app.route("/")
def home():
    return "🚀 CO2 Backend Running"

# -------------------------------
# ✅ HEALTH CHECK
# -------------------------------
@app.route("/health")
def health():
    return jsonify({"status": "Backend running"})

# -------------------------------
# ✅ SINGLE PREDICTION (IMPROVED)
# -------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        required_fields = [
            'time_min', 'occupancy', 'ventilation_efficiency',
            'ventilation_rate', 'temperature_c', 'humidity_pct'
        ]

        # 🔥 Validation
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} missing"}), 400

        # Convert input → array
        features = np.array([[data[f] for f in required_fields]])

        # Prediction
        prediction = model.predict(features)[0]

        # Status logic
        if prediction < 600:
            status = "Optimal"
        elif prediction < 800:
            status = "Acceptable"
        else:
            status = "High"

        # Logging
        logging.info(f"Prediction: {prediction} | Input: {data}")

        return jsonify({
            "predicted_co2": round(float(prediction), 2),
            "status": status
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------------
# 🔥 BATCH PREDICTION (ADVANCED)
# -------------------------------
@app.route("/predict_batch", methods=["POST"])
def predict_batch():
    try:
        data = request.get_json()

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
    app.run(debug=True)
    
