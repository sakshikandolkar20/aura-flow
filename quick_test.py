"""
═══════════════════════════════════════════════════════════════════════════════
                  🎯 MODEL TESTING QUICK REFERENCE CARD 🎯
═══════════════════════════════════════════════════════════════════════════════
"""

# Quick way to test your model - copy this into a Python script

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# ============================================================================
# 🟢 SIMPLE 3-STEP TESTING
# ============================================================================

print("\n🟢 SIMPLE MODEL TESTING (3 Steps)\n")

# STEP 1: Load and prepare data
df = pd.read_csv('icu_co2_data.csv')
X = df[['time_min', 'occupancy', 'ventilation_efficiency', 
         'ventilation_rate', 'temperature_c', 'humidity_pct']]
y = df['co2_ppm']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# STEP 2: Train model
model = LinearRegression()
model.fit(X_train, y_train)

# STEP 3: Test and evaluate
y_pred = model.predict(X_test)

# ============================================================================
# ✅ TEST 1: Is accuracy good? (Should be > 0.9)
# ============================================================================
r2 = r2_score(y_test, y_pred)
print(f"✅ TEST 1 - Accuracy")
print(f"   R² Score: {r2:.4f}")
if r2 > 0.9:
    print(f"   ✓ PASS: Excellent accuracy (98%+ variance explained)")
else:
    print(f"   ✗ FAIL: Accuracy too low (below 90%)")

# ============================================================================
# ✅ TEST 2: Are errors small? (MAE should be < 15 ppm)
# ============================================================================
mae = mean_absolute_error(y_test, y_pred)
print(f"\n✅ TEST 2 - Error Size")
print(f"   Mean Absolute Error: {mae:.2f} ppm")
if mae < 10:
    print(f"   ✓ PASS: Small errors (very accurate)")
elif mae < 20:
    print(f"   ~ FAIR: Medium errors (acceptable)")
else:
    print(f"   ✗ FAIL: Large errors (not accurate)")

# ============================================================================
# ✅ TEST 3: Is there bias? (Mean should be close to 0)
# ============================================================================
residuals = y_test - y_pred
bias = residuals.mean()
print(f"\n✅ TEST 3 - Bias Check")
print(f"   Mean of errors: {bias:.4f} ppm")
if abs(bias) < 2:
    print(f"   ✓ PASS: No systematic bias")
else:
    print(f"   ⚠ WARNING: Some bias detected")

# ============================================================================
# 🎯 FINAL VERDICT
# ============================================================================
print(f"\n{'='*75}")
print("🎯 QUICK VERDICT")
print('='*75)

score = 0
if r2 > 0.9: score += 1
if mae < 15: score += 1
if abs(bias) < 2: score += 1

if score == 3:
    print("✅ EXCELLENT - Model works very well! Ready to use.")
elif score == 2:
    print("✅ GOOD - Model works well. Ready to use with caution.")
elif score == 1:
    print("⚠️ FAIR - Model has issues. Consider improvements.")
else:
    print("❌ POOR - Model needs work. Don't use yet.")

print(f"\nTests Passed: {score}/3")
print('='*75)

# ============================================================================
# 🔍 ADVANCED TESTING (Optional)
# ============================================================================

print("\n" + "="*75)
print("🔍 ADVANCED TESTING (For deeper analysis)")
print("="*75)

print("\n📊 More Detailed Metrics:")
print(f"   • Mean Squared Error (MSE):  {mean_squared_error(y_test, y_pred):.2f}")
print(f"   • Root Mean Squared Error:   {np.sqrt(mean_squared_error(y_test, y_pred)):.2f}")
print(f"   • Error Range:               {residuals.min():.2f} to {residuals.max():.2f} ppm")
print(f"   • Errors within ±10 ppm:    {(np.abs(residuals) <= 10).sum()}/{len(residuals)}")

# Compare train vs test (check for overfitting)
train_r2 = model.score(X_train, y_train)
test_r2 = r2_score(y_test, y_pred)
print(f"\n🔍 Overfitting Check:")
print(f"   • Training R²: {train_r2:.4f}")
print(f"   • Testing R²:  {test_r2:.4f}")
print(f"   • Difference:  {abs(train_r2 - test_r2):.4f}")
if abs(train_r2 - test_r2) < 0.02:
    print(f"   ✓ No overfitting - Model generalizes well")
else:
    print(f"   ⚠ Some overfitting detected")

# Feature importance
print(f"\n🎯 Top 3 Important Features:")
coef_df = pd.DataFrame({
    'Feature': X.columns,
    'Coefficient': np.abs(model.coef_)
}).sort_values('Coefficient', ascending=False)
for i, (feat, coef) in enumerate(zip(coef_df['Feature'][:3], coef_df['Coefficient'][:3]), 1):
    print(f"   {i}. {feat}: {coef:.4f}")

print("\n" + "="*75)

# ============================================================================
# 📋 ONE-LINE TESTS (Copy-paste ready)
# ============================================================================

print("\n📋 Copy-Paste Ready One-Liners:\n")

print("# Check if model is accurate")
print(f"print(f'Accuracy: {{r2_score(y_test, model.predict(X_test)):.2%}}')")

print("\n# Check average error")
print(f"print(f'Average Error: {{mean_absolute_error(y_test, model.predict(X_test)):.2f}} ppm')")

print("\n# Check if predictions make sense")
print("sample = pd.DataFrame({{'time_min': [60], 'occupancy': [5], ...")
print("        'ventilation_efficiency': [0.75], 'ventilation_rate': [45],")
print("        'temperature_c': [22], 'humidity_pct': [46]}})")
print("print(f'Predicted CO₂: {{model.predict(sample)[0]:.1f}} ppm')")

# ============================================================================
# 🎓 WHAT EACH METRIC MEANS
# ============================================================================

print("\n" + "="*75)
print("🎓 WHAT EACH METRIC MEANS")
print("="*75)

metrics_info = {
    'R² Score': {
        'meaning': 'Percentage of variation explained by model',
        'range': '0.0 to 1.0',
        'good': '> 0.9 (90%+)',
        'poor': '< 0.7 (70%)',
        'example': 'R²=0.98 means model explains 98% of CO₂ variation'
    },
    'MAE': {
        'meaning': 'Average prediction error (absolute value)',
        'range': '0 to ∞',
        'good': '< 10 ppm',
        'poor': '> 20 ppm',
        'example': 'MAE=8.68 means typical prediction is ±8.68 ppm off'
    },
    'MSE': {
        'meaning': 'Average squared error (penalizes large errors)',
        'range': '0 to ∞',
        'good': '< 100 ppm²',
        'poor': '> 500 ppm²',
        'example': 'MSE=110 means squared error is 110 ppm²'
    },
    'RMSE': {
        'meaning': 'Square root of MSE (same units as target)',
        'range': '0 to ∞',
        'good': '< 12 ppm',
        'poor': '> 25 ppm',
        'example': 'RMSE=10.5 means typical standard deviation of error'
    }
}

for metric, info in metrics_info.items():
    print(f"\n{metric}:")
    print(f"  Meaning: {info['meaning']}")
    print(f"  Good:    {info['good']}")
    print(f"  Example: {info['example']}")

# ============================================================================
# ✨ FINAL CHECKLIST
# ============================================================================

print("\n" + "="*75)
print("✨ FINAL CHECKLIST - Is My Model Ready?")
print("="*75)

checklist = {
    "R² > 0.9": r2 > 0.9,
    "MAE < 15 ppm": mae < 15,
    "No bias (residuals mean ≈ 0)": abs(bias) < 2,
    "No overfitting (train ≈ test)": abs(train_r2 - test_r2) < 0.05,
}

checks_passed = 0
for check, result in checklist.items():
    symbol = "✅" if result else "❌"
    print(f"{symbol} {check}")
    if result:
        checks_passed += 1

print(f"\nScore: {checks_passed}/{len(checklist)} checks passed")

if checks_passed == len(checklist):
    print("\n🚀 MODEL IS READY FOR DEPLOYMENT!")
elif checks_passed >= len(checklist) - 1:
    print("\n✅ MODEL IS MOSTLY READY (Minor issues)")
else:
    print("\n⚠️ MODEL NEEDS IMPROVEMENT")

print("\n" + "="*75)
