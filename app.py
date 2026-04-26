from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import logging
import os
from pathlib import Path

from save_model import build_and_save_model

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)

# -------------------------------
# LOAD MODEL
# -------------------------------
def load_model():
    model_candidates = sorted(
        Path(".").glob("co2_model*.pkl"),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )

    for model_file in model_candidates:
        try:
            logging.info(f"Loading model: {model_file}")
            m = joblib.load(model_file)
            print(f"[OK] Model loaded from {model_file}")
            return m
        except Exception as error:
            logging.warning(f"Failed to load {model_file}: {error}")

    logging.warning("No model found, rebuilding...")
    m = build_and_save_model()
    print("[OK] Model rebuilt")
    return m


model = load_model()

# 🔁 Maintain previous CO₂ (for derived features)
last_co2 = 450


# -------------------------------
# ROUTES
# -------------------------------
@app.route("/")
def home():
    return "CO2 Backend Running"


@app.route("/health")
def health():
    return jsonify({"status": "Backend running"})


# -------------------------------
# PREDICT
# -------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    global last_co2

    try:
        data = request.get_json(force=True)
        logging.info(f"Request: {data}")

        # Required fields from frontend
        required_fields = [
            "time_min",
            "occupancy",
            "ventilation_efficiency",
            "ventilation_rate",
            "temperature_c",
            "humidity_pct"
        ]

        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} missing"}), 400

        # Convert inputs
        time_min = float(data["time_min"])
        occupancy = float(data["occupancy"])
        ventilation_efficiency = float(data["ventilation_efficiency"])
        ventilation_rate = float(data["ventilation_rate"])
        temperature_c = float(data["temperature_c"])
        humidity_pct = float(data["humidity_pct"])

        # 🔥 Derived features (IMPORTANT for your trained model)
        prev_co2 = last_co2
        co2_rolling_avg = (prev_co2 + last_co2) / 2

        # ✅ EXACT 8 FEATURES (same as training)
        features = [
            time_min,
            prev_co2,
            co2_rolling_avg,
            occupancy,
            ventilation_efficiency,
            ventilation_rate,
            temperature_c,
            humidity_pct
        ]

        features = np.array(features).reshape(1, -1)

        # Prediction
        prediction = model.predict(features)[0]

        # Clamp realistic minimum
        prediction = max(prediction, 400)

        # Update state
        last_co2 = prediction

        # Status
        if prediction < 800:
            status = "Safe"
        elif prediction < 1200:
            status = "Moderate"
        else:
            status = "Risky"

        result = {
            "predicted_co2": round(float(prediction), 2),
            "status": status
        }

        logging.info(f"Result: {result}")
        return jsonify(result)

    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# -------------------------------
# RUN SERVER (DEPLOYMENT READY)
# -------------------------------
if __name__ == "__main__":
    print("=" * 50)
    print("AuraFlow Backend starting...")
    print("=" * 50)

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=True
    )