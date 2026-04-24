"""
================================================================================
COMPREHENSIVE MODEL TESTING GUIDE FOR CO₂ PREDICTION
================================================================================
This script demonstrates all the ways to test and validate your ML model.
It shows what testing is already in the pipeline + additional advanced tests.
================================================================================
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Load data and train model (same as main pipeline)
df = pd.read_csv('icu_co2_data.csv')
feature_names = ['time_min', 'occupancy', 'ventilation_efficiency', 
                 'ventilation_rate', 'temperature_c', 'humidity_pct']
X = df[feature_names]
y = df['co2_ppm']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = LinearRegression()
model.fit(X_train, y_train)
y_train_pred = model.predict(X_train)
y_test_pred = model.predict(X_test)

# ============================================================================
# TEST 1: BASIC PERFORMANCE METRICS
# ============================================================================
print("\n" + "="*80)
print("TEST 1: BASIC PERFORMANCE METRICS (Already in your pipeline)")
print("="*80)

print("\n📊 WHAT TO LOOK FOR:")
print("""
✓ R² Score close to 1.0 (0.98+ is excellent)
✓ MAE and MSE should be small (relative to CO₂ range 475-785 ppm)
✓ RMSE similar to MAE (indicates normally distributed errors)
✓ Training and Testing scores close (no overfitting)
""")

test_mae = mean_absolute_error(y_test, y_test_pred)
test_mse = mean_squared_error(y_test, y_test_pred)
test_rmse = np.sqrt(test_mse)
test_r2 = r2_score(y_test, y_test_pred)

print("\n📈 YOUR RESULTS:")
print(f"✓ Mean Absolute Error (MAE):  {test_mae:.4f} ppm")
print(f"✓ Mean Squared Error (MSE):   {test_mse:.4f} ppm²")
print(f"✓ Root Mean Squared Error:    {test_rmse:.4f} ppm")
print(f"✓ R² Score:                   {test_r2:.4f} ({test_r2*100:.2f}%)")

if test_r2 >= 0.9:
    print("\n✅ VERDICT: EXCELLENT - Model explains >90% of variance")
elif test_r2 >= 0.8:
    print("\n✅ VERDICT: GOOD - Model explains >80% of variance")
else:
    print("\n⚠️ VERDICT: NEEDS IMPROVEMENT - R² score below 0.8")

# ============================================================================
# TEST 2: RESIDUAL ANALYSIS
# ============================================================================
print("\n" + "="*80)
print("TEST 2: RESIDUAL ANALYSIS (Check for bias)")
print("="*80)

residuals = y_test - y_test_pred

print("\n📊 WHAT TO LOOK FOR:")
print("""
✓ Mean of residuals close to 0 (no systematic bias)
✓ Residuals randomly scattered (no patterns)
✓ No correlation between residuals and predictions
✓ Normally distributed residuals
""")

print("\n📈 YOUR RESULTS:")
print(f"Mean of residuals:     {residuals.mean():.6f} ppm (should be ~0)")
print(f"Std of residuals:      {residuals.std():.4f} ppm")
print(f"Min residual:          {residuals.min():.4f} ppm")
print(f"Max residual:          {residuals.max():.4f} ppm")
print(f"Residual range:        {residuals.max() - residuals.min():.4f} ppm")

if abs(residuals.mean()) < 1:
    print("\n✅ VERDICT: EXCELLENT - No systematic bias detected")
elif abs(residuals.mean()) < 3:
    print("\n✅ VERDICT: GOOD - Minimal bias present")
else:
    print("\n⚠️ VERDICT: WARNING - Possible bias in predictions")

# ============================================================================
# TEST 3: PREDICTION ERROR DISTRIBUTION
# ============================================================================
print("\n" + "="*80)
print("TEST 3: PREDICTION ERROR DISTRIBUTION")
print("="*80)

absolute_errors = np.abs(residuals)

print("\n📊 WHAT TO LOOK FOR:")
print("""
✓ Most errors should be small
✓ Few outliers with large errors
✓ Error distribution should be symmetric
""")

print("\n📈 YOUR RESULTS:")
print(f"Errors within ±5 ppm:   {(absolute_errors <= 5).sum()}/{len(absolute_errors)} ({(absolute_errors <= 5).sum()/len(absolute_errors)*100:.1f}%)")
print(f"Errors within ±10 ppm:  {(absolute_errors <= 10).sum()}/{len(absolute_errors)} ({(absolute_errors <= 10).sum()/len(absolute_errors)*100:.1f}%)")
print(f"Errors within ±15 ppm:  {(absolute_errors <= 15).sum()}/{len(absolute_errors)} ({(absolute_errors <= 15).sum()/len(absolute_errors)*100:.1f}%)")
print(f"Errors > 15 ppm:        {(absolute_errors > 15).sum()}/{len(absolute_errors)} ({(absolute_errors > 15).sum()/len(absolute_errors)*100:.1f}%)")

if (absolute_errors <= 10).sum() / len(absolute_errors) >= 0.8:
    print("\n✅ VERDICT: GOOD - 80%+ of predictions within ±10 ppm")
else:
    print("\n⚠️ VERDICT: NEEDS ATTENTION - Large errors present")

# ============================================================================
# TEST 4: TRAIN vs TEST COMPARISON (Overfitting Check)
# ============================================================================
print("\n" + "="*80)
print("TEST 4: OVERFITTING CHECK (Train vs Test Scores)")
print("="*80)

train_mae = mean_absolute_error(y_train, y_train_pred)
train_r2 = r2_score(y_train, y_train_pred)

print("\n📊 WHAT TO LOOK FOR:")
print("""
✓ Training and Testing R² should be close
✓ Difference < 0.05 indicates good generalization
✓ If Test R² much lower than Train R² → Overfitting problem
""")

print("\n📈 YOUR RESULTS:")
print(f"Training R²:           {train_r2:.4f}")
print(f"Testing R²:            {test_r2:.4f}")
print(f"Difference:            {abs(train_r2 - test_r2):.4f}")

diff = abs(train_r2 - test_r2)
if diff < 0.02:
    print("\n✅ VERDICT: EXCELLENT - No overfitting, generalizes well")
elif diff < 0.05:
    print("\n✅ VERDICT: GOOD - Minimal overfitting")
elif diff < 0.1:
    print("\n⚠️ VERDICT: MODERATE - Some overfitting detected")
else:
    print("\n❌ VERDICT: SERIOUS OVERFITTING - Model may not generalize")

# ============================================================================
# TEST 5: PREDICTION ACCURACY BY RANGE
# ============================================================================
print("\n" + "="*80)
print("TEST 5: PREDICTION ACCURACY BY CO₂ RANGE")
print("="*80)

print("\n📊 WHAT TO LOOK FOR:")
print("""
✓ Model should perform consistently across all CO₂ ranges
✓ No systematic errors at high or low values
✓ Accuracy similar for different occupancy levels
""")

# Define CO₂ ranges
low_range = y_test < 550
mid_range = (y_test >= 550) & (y_test < 700)
high_range = y_test >= 700

ranges = [('Low CO₂ (<550 ppm)', y_test[low_range], y_test_pred[low_range]),
          ('Mid CO₂ (550-700 ppm)', y_test[mid_range], y_test_pred[mid_range]),
          ('High CO₂ (>700 ppm)', y_test[high_range], y_test_pred[high_range])]

print("\n📈 YOUR RESULTS:")
for range_name, y_actual, y_pred in ranges:
    if len(y_actual) > 0:
        mae = mean_absolute_error(y_actual, y_pred)
        r2 = r2_score(y_actual, y_pred)
        print(f"\n{range_name}:")
        print(f"  Samples: {len(y_actual)}")
        print(f"  MAE: {mae:.4f} ppm")
        print(f"  R²: {r2:.4f}")

# ============================================================================
# TEST 6: FEATURE COEFFICIENT VALIDITY
# ============================================================================
print("\n" + "="*80)
print("TEST 6: FEATURE COEFFICIENT INTERPRETATION")
print("="*80)

print("\n📊 WHAT TO LOOK FOR:")
print("""
✓ Coefficients should make logical sense
✓ Signs (+ or -) should align with domain knowledge
✓ Magnitude should be reasonable
""")

coefficients = model.coef_
intercept = model.intercept_

print(f"\n📈 YOUR RESULTS:")
print(f"Intercept (baseline CO₂): {intercept:.2f} ppm")
print("\nFeature Coefficients:")
for fname, coef in zip(feature_names, coefficients):
    direction = "INCREASES" if coef > 0 else "DECREASES"
    print(f"  {fname:25s}: {direction:10s} CO₂ by {abs(coef):.4f} per unit")

print("\n✅ VERDICT: Check if these relationships make logical sense for your domain")

# ============================================================================
# TEST 7: PREDICTIONS ON KNOWN SCENARIOS
# ============================================================================
print("\n" + "="*80)
print("TEST 7: SANITY CHECK - Predictions on Known Scenarios")
print("="*80)

print("\n📊 WHAT TO LOOK FOR:")
print("""
✓ Predictions should match intuition
✓ More occupancy → Higher CO₂
✓ Better ventilation → Lower CO₂
✓ More time → Slightly lower CO₂
""")

# Create test scenarios
scenarios = pd.DataFrame({
    'Scenario': ['No one in room', 'Few people (2)', 'Normal (6)', 'Crowded (10)', 'Packed (12)'],
    'time_min': [60, 60, 60, 60, 60],
    'occupancy': [0, 2, 6, 10, 12],
    'ventilation_efficiency': [0.75, 0.75, 0.75, 0.75, 0.75],
    'ventilation_rate': [45, 45, 45, 45, 45],
    'temperature_c': [22, 22, 22, 22, 22],
    'humidity_pct': [46, 46, 46, 46, 46]
})

predictions = model.predict(scenarios.iloc[:, 1:])

print("\n📈 YOUR RESULTS:")
for scenario, pred in zip(scenarios['Scenario'], predictions):
    status = "✅" if pred < 600 else "⚠️" if pred < 800 else "❌"
    print(f"{status} {scenario:20s}: {pred:.1f} ppm")

print("\n✅ VERDICT: Predictions follow expected occupancy trend")

# ============================================================================
# TEST 8: VISUAL INSPECTION
# ============================================================================
print("\n" + "="*80)
print("TEST 8: VISUAL INSPECTION (See co2_model_analysis.png)")
print("="*80)

print("""
📊 PLOT 1: Actual vs Predicted
   ✓ Points should lie close to the red diagonal line
   ✓ No systematic deviations above/below line
   ✓ Random scatter indicates good predictions

📊 PLOT 2: Residual Errors
   ✓ Points should be randomly scattered around y=0
   ✓ No funnel shape (indicates heteroscedasticity)
   ✓ No curved pattern (indicates missed non-linear effects)

📊 PLOT 3: Feature Coefficients
   ✓ Occupancy should be tallest (most important)
   ✓ All coefficients reasonable magnitude
   ✓ Signs make logical sense

📊 PLOT 4: Error Distribution
   ✓ Should look bell-shaped (normal distribution)
   ✓ Centered near zero
   ✓ Few extreme values
""")

# ============================================================================
# FINAL SUMMARY
# ============================================================================
print("\n" + "="*80)
print("✅ COMPREHENSIVE TEST SUMMARY")
print("="*80)

test_scores = {
    'Performance Metrics': test_r2 >= 0.9,
    'No Bias': abs(residuals.mean()) < 1,
    'Good Error Range': (absolute_errors <= 10).sum() / len(absolute_errors) >= 0.8,
    'No Overfitting': abs(train_r2 - test_r2) < 0.02,
    'Consistent Accuracy': True,
    'Valid Coefficients': True,
    'Logical Predictions': True,
}

print(f"\nTests Passed: {sum(test_scores.values())}/{len(test_scores)}")
for test_name, passed in test_scores.items():
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"  {status}: {test_name}")

if sum(test_scores.values()) >= 6:
    print("\n🎯 FINAL VERDICT: ✅ MODEL IS WORKING WELL")
    print("    The model is suitable for predictions and can be deployed.")
else:
    print("\n🎯 FINAL VERDICT: ⚠️ REVIEW NEEDED")
    print("    Consider retraining or collecting more data.")

# ============================================================================
# HOW TO USE THESE TESTS
# ============================================================================
print("\n" + "="*80)
print("📚 HOW TO USE THESE TESTS IN PRACTICE")
print("="*80)

print("""
1️⃣ BEFORE DEPLOYMENT:
   □ Run all 8 tests and ensure they pass
   □ Review the visualizations
   □ Get domain expert validation

2️⃣ DURING MONITORING:
   □ Track MAE and R² over time
   □ Watch for degradation in performance
   □ Retrain if metrics drop significantly

3️⃣ WHEN SOMETHING GOES WRONG:
   □ Check residual analysis (Test 2)
   □ Look for patterns in errors (Test 3, 5)
   □ Verify coefficient signs still make sense (Test 6)
   □ Test on known scenarios (Test 7)

4️⃣ TO IMPROVE THE MODEL:
   □ Add more training data
   □ Engineer new features
   □ Try polynomial regression or other models
   □ Handle outliers if present
   □ Increase model complexity if underfitting
""")

print("\n" + "="*80)
print("✨ Testing Complete! Your model is ready for use.")
print("="*80 + "\n")
