import requests

BASE_URL = "http://127.0.0.1:5000"
PREDICT_URL = f"{BASE_URL}/predict"
PREDICT_BATCH_URL = f"{BASE_URL}/predict_batch"


def print_result(label, response):
    print(f"\n{label}")
    print(f"Status: {response.status_code}")
    try:
        print(f"Body: {response.json()}")
    except ValueError:
        print(f"Body: {response.text}")


def test_predict_cases():
    cases = [
        (
            "Case 1: low occupancy, good ventilation",
            {
                "time_min": 20,
                "occupancy": 2,
                "ventilation_efficiency": 0.9,
                "ventilation_rate": 70,
                "temperature_c": 22,
                "humidity_pct": 45,
            },
        ),
        (
            "Case 2: high occupancy, weak ventilation",
            {
                "time_min": 60,
                "occupancy": 15,
                "ventilation_efficiency": 0.5,
                "ventilation_rate": 20,
                "temperature_c": 25,
                "humidity_pct": 55,
            },
        ),
        (
            "Case 3: medium everything",
            {
                "time_min": 40,
                "occupancy": 8,
                "ventilation_efficiency": 0.75,
                "ventilation_rate": 45,
                "temperature_c": 23,
                "humidity_pct": 50,
            },
        ),
    ]

    for label, payload in cases:
        response = requests.post(PREDICT_URL, json=payload, timeout=10)
        print_result(label, response)


def test_validation_failure():
    bad_payload = {
        "time_min": 10,
        "occupancy": 5,
    }
    response = requests.post(PREDICT_URL, json=bad_payload, timeout=10)
    print_result("Validation test (expected 400)", response)


def test_predict_batch():
    batch_payload = [
        {
            "time_min": 20,
            "occupancy": 3,
            "ventilation_efficiency": 0.9,
            "ventilation_rate": 70,
            "temperature_c": 22,
            "humidity_pct": 44,
        },
        {
            "time_min": 45,
            "occupancy": 9,
            "ventilation_efficiency": 0.7,
            "ventilation_rate": 40,
            "temperature_c": 24,
            "humidity_pct": 50,
        },
        {
            "time_min": 70,
            "occupancy": 14,
            "ventilation_efficiency": 0.5,
            "ventilation_rate": 25,
            "temperature_c": 26,
            "humidity_pct": 58,
        },
    ]

    response = requests.post(PREDICT_BATCH_URL, json=batch_payload, timeout=10)
    print_result("Batch prediction test", response)


if __name__ == "__main__":
    try:
        test_predict_cases()
        test_validation_failure()
        test_predict_batch()
    except requests.exceptions.RequestException as error:
        print(f"Request failed: {error}")
        print("Make sure backend is running with: python app.py")
