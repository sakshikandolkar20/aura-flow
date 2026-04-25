import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib
import time


def build_and_save_model(
    dataset_path: str = "icu_co2_data.csv",
    model_path: str = "co2_model.pkl",
):
    df = pd.read_csv(dataset_path)

    features = [
        "time_min",
        "occupancy",
        "ventilation_efficiency",
        "ventilation_rate",
        "temperature_c",
        "humidity_pct",
    ]

    X = df[features]
    y = df["co2_ppm"]

    model = LinearRegression()
    model.fit(X, y)

    last_error = None
    for _ in range(5):
        try:
            joblib.dump(model, model_path)
            last_error = None
            break
        except PermissionError as error:
            last_error = error
            time.sleep(1)

    if last_error is not None:
        raise last_error

    return model


if __name__ == "__main__":
    build_and_save_model()
    print("Model saved successfully.")
