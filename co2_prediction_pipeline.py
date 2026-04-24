"""
================================================================================
CO₂ PREDICTION MODEL FOR ICU ENVIRONMENT
================================================================================
This script implements a complete machine learning pipeline to predict CO₂ levels
in an ICU environment based on environmental and occupancy features.

Features used:
- time_min: Time in minutes
- occupancy: Number of people in the room
- ventilation_efficiency: System efficiency (0-1 scale)
- ventilation_rate: Rate of air exchange in CFM
- temperature_c: Temperature in Celsius
- humidity_pct: Humidity percentage

Target: co2_ppm (CO₂ concentration in parts per million)
================================================================================
"""

# ============================================================================
# 1. IMPORT REQUIRED LIBRARIES
# ============================================================================
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Set style for better-looking plots
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 6)

# ============================================================================
# 2. LOAD AND INSPECT THE DATASET
# ============================================================================
print("=" * 80)
print("STEP 1: LOADING AND INSPECTING DATA")
print("=" * 80)

# Load the dataset
df = pd.read_csv('icu_co2_data.csv')

print("\n✓ Dataset loaded successfully!")
print(f"\nDataset Shape: {df.shape[0]} rows × {df.shape[1]} columns")

# Display first few rows
print("\n--- First 5 rows of the dataset ---")
print(df.head())

# Display basic information about the dataset
print("\n--- Dataset Information ---")
print(df.info())

# Display statistical summary
print("\n--- Statistical Summary ---")
print(df.describe())

# Check for missing values
print("\n--- Missing Values ---")
missing_values = df.isnull().sum()
if missing_values.sum() == 0:
    print("✓ No missing values found in the dataset!")
else:
    print(missing_values)

# ============================================================================
# 3. DATA PREPARATION: SELECT FEATURES AND TARGET
# ============================================================================
print("\n" + "=" * 80)
print("STEP 2: FEATURE SELECTION")
print("=" * 80)

# Define feature names (input variables)
feature_names = ['time_min', 'occupancy', 'ventilation_efficiency', 
                 'ventilation_rate', 'temperature_c', 'humidity_pct']

# Select features (X) - independent variables
X = df[feature_names]

# Select target (y) - dependent variable
y = df['co2_ppm']

print(f"\n✓ Selected {len(feature_names)} features for the model:")
for i, feature in enumerate(feature_names, 1):
    print(f"   {i}. {feature}")

print(f"\n✓ Target variable: co2_ppm")
print(f"\nFeature matrix shape (X): {X.shape}")
print(f"Target vector shape (y): {y.shape}")

# ============================================================================
# 4. SPLIT DATA INTO TRAINING AND TESTING SETS
# ============================================================================
print("\n" + "=" * 80)
print("STEP 3: TRAIN-TEST SPLIT")
print("=" * 80)

# Split data: 80% training, 20% testing (random_state for reproducibility)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"\n✓ Data split completed:")
print(f"   Training set: {X_train.shape[0]} samples ({X_train.shape[0]/len(df)*100:.1f}%)")
print(f"   Testing set:  {X_test.shape[0]} samples ({X_test.shape[0]/len(df)*100:.1f}%)")

# ============================================================================
# 5. TRAIN THE MULTIPLE LINEAR REGRESSION MODEL
# ============================================================================
print("\n" + "=" * 80)
print("STEP 4: MODEL TRAINING")
print("=" * 80)

# Create and train the model
model = LinearRegression()
model.fit(X_train, y_train)

print("\n✓ Multiple Linear Regression model trained successfully!")

# ============================================================================
# 6. MAKE PREDICTIONS
# ============================================================================
print("\n" + "=" * 80)
print("STEP 5: MAKING PREDICTIONS")
print("=" * 80)

# Make predictions on training set
y_train_pred = model.predict(X_train)

# Make predictions on testing set
y_test_pred = model.predict(X_test)

print("\n✓ Predictions completed on both training and test sets!")
print(f"\nFirst 5 test predictions:")
prediction_comparison = pd.DataFrame({
    'Actual': y_test.values[:5],
    'Predicted': y_test_pred[:5],
    'Difference': y_test.values[:5] - y_test_pred[:5]
})
print(prediction_comparison)

# ============================================================================
# 7. EVALUATE MODEL PERFORMANCE
# ============================================================================
print("\n" + "=" * 80)
print("STEP 6: MODEL EVALUATION")
print("=" * 80)

# Calculate evaluation metrics for training set
train_mae = mean_absolute_error(y_train, y_train_pred)
train_mse = mean_squared_error(y_train, y_train_pred)
train_rmse = np.sqrt(train_mse)
train_r2 = r2_score(y_train, y_train_pred)

# Calculate evaluation metrics for testing set
test_mae = mean_absolute_error(y_test, y_test_pred)
test_mse = mean_squared_error(y_test, y_test_pred)
test_rmse = np.sqrt(test_mse)
test_r2 = r2_score(y_test, y_test_pred)

# Display training set metrics
print("\n--- TRAINING SET METRICS ---")
print(f"Mean Absolute Error (MAE):    {train_mae:.4f} ppm")
print(f"  └─ Average prediction error (absolute)")
print(f"Mean Squared Error (MSE):     {train_mse:.4f} ppm²")
print(f"  └─ Average squared errors (penalizes larger errors)")
print(f"Root Mean Squared Error (RMSE): {train_rmse:.4f} ppm")
print(f"  └─ Standard deviation of errors")
print(f"R² Score:                     {train_r2:.4f}")
print(f"  └─ Proportion of variance explained (1.0 = perfect)")

# Display testing set metrics
print("\n--- TESTING SET METRICS ---")
print(f"Mean Absolute Error (MAE):    {test_mae:.4f} ppm")
print(f"  └─ Average prediction error (absolute)")
print(f"Mean Squared Error (MSE):     {test_mse:.4f} ppm²")
print(f"  └─ Average squared errors (penalizes larger errors)")
print(f"Root Mean Squared Error (RMSE): {test_rmse:.4f} ppm")
print(f"  └─ Standard deviation of errors")
print(f"R² Score:                     {test_r2:.4f}")
print(f"  └─ Proportion of variance explained (1.0 = perfect)")

# Create comparison dataframe
metrics_comparison = pd.DataFrame({
    'Metric': ['MAE', 'MSE', 'RMSE', 'R²'],
    'Training': [train_mae, train_mse, train_rmse, train_r2],
    'Testing': [test_mae, test_mse, test_rmse, test_r2]
})
print("\n--- COMPARISON TABLE ---")
print(metrics_comparison.to_string(index=False))

# ============================================================================
# 8. DISPLAY MODEL COEFFICIENTS (FEATURE IMPORTANCE)
# ============================================================================
print("\n" + "=" * 80)
print("STEP 7: FEATURE IMPORTANCE ANALYSIS")
print("=" * 80)

# Get model intercept and coefficients
intercept = model.intercept_
coefficients = model.coef_

print(f"\nModel Intercept (baseline CO₂ level): {intercept:.4f} ppm")
print("\n--- Feature Coefficients (Impact on CO₂) ---")

# Create coefficients dataframe
coef_df = pd.DataFrame({
    'Feature': feature_names,
    'Coefficient': coefficients,
    'Impact': ['↑' if c > 0 else '↓' for c in coefficients]
})

# Sort by absolute coefficient value
coef_df['Abs_Coefficient'] = np.abs(coef_df['Coefficient'])
coef_df = coef_df.sort_values('Abs_Coefficient', ascending=False)

print(coef_df[['Feature', 'Coefficient', 'Impact']].to_string(index=False))

print("\n--- Interpretation ---")
for idx, row in coef_df.iterrows():
    feature = row['Feature']
    coef = row['Coefficient']
    impact_type = "INCREASES" if coef > 0 else "DECREASES"
    print(f"• {feature:25s}: {impact_type:10s} CO₂ by {abs(coef):.4f} ppm per unit")

# ============================================================================
# 9. VISUALIZATIONS
# ============================================================================
print("\n" + "=" * 80)
print("STEP 8: GENERATING VISUALIZATIONS")
print("=" * 80)

# Create a figure with multiple subplots
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('CO₂ Prediction Model - Performance Analysis', fontsize=16, fontweight='bold')

# --- Subplot 1: Actual vs Predicted (Test Set) ---
ax1 = axes[0, 0]
ax1.scatter(y_test, y_test_pred, alpha=0.6, color='blue', s=50, label='Predictions')
ax1.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 
         'r--', lw=2, label='Perfect Prediction')
ax1.set_xlabel('Actual CO₂ (ppm)', fontsize=11, fontweight='bold')
ax1.set_ylabel('Predicted CO₂ (ppm)', fontsize=11, fontweight='bold')
ax1.set_title('Actual vs Predicted CO₂ (Test Set)', fontsize=12, fontweight='bold')
ax1.legend()
ax1.grid(True, alpha=0.3)

# --- Subplot 2: Residual Errors ---
ax2 = axes[0, 1]
residuals = y_test - y_test_pred
ax2.scatter(y_test_pred, residuals, alpha=0.6, color='green', s=50)
ax2.axhline(y=0, color='r', linestyle='--', lw=2)
ax2.set_xlabel('Predicted CO₂ (ppm)', fontsize=11, fontweight='bold')
ax2.set_ylabel('Residuals (ppm)', fontsize=11, fontweight='bold')
ax2.set_title('Residual Errors (Test Set)', fontsize=12, fontweight='bold')
ax2.grid(True, alpha=0.3)

# --- Subplot 3: Feature Coefficients ---
ax3 = axes[1, 0]
colors = ['green' if c > 0 else 'red' for c in coef_df['Coefficient']]
ax3.barh(coef_df['Feature'], coef_df['Coefficient'], color=colors, alpha=0.7)
ax3.set_xlabel('Coefficient Value', fontsize=11, fontweight='bold')
ax3.set_title('Feature Coefficients (Impact on CO₂)', fontsize=12, fontweight='bold')
ax3.axvline(x=0, color='black', linestyle='-', lw=0.8)
ax3.grid(True, alpha=0.3, axis='x')

# --- Subplot 4: Prediction Error Distribution ---
ax4 = axes[1, 1]
ax4.hist(residuals, bins=15, color='purple', alpha=0.7, edgecolor='black')
ax4.axvline(x=0, color='r', linestyle='--', lw=2, label='Zero Error')
ax4.set_xlabel('Error (ppm)', fontsize=11, fontweight='bold')
ax4.set_ylabel('Frequency', fontsize=11, fontweight='bold')
ax4.set_title('Distribution of Prediction Errors', fontsize=12, fontweight='bold')
ax4.legend()
ax4.grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.savefig('co2_model_analysis.png', dpi=300, bbox_inches='tight')
print("\n✓ Visualization saved as 'co2_model_analysis.png'")
# plt.show()  # Commented out for non-interactive execution

# ============================================================================
# 10. PREDICTIONS FOR NEW INPUT CONDITIONS
# ============================================================================
print("\n" + "=" * 80)
print("STEP 9: PREDICTION FOR NEW INPUT CONDITIONS")
print("=" * 80)

# Sample new input data
new_conditions = pd.DataFrame({
    'time_min': [50, 75, 120],
    'occupancy': [5, 8, 12],
    'ventilation_efficiency': [0.75, 0.80, 0.72],
    'ventilation_rate': [45, 50, 42],
    'temperature_c': [22.2, 22.5, 21.9],
    'humidity_pct': [46.0, 47.0, 45.0]
})

print("\n--- New Input Conditions ---")
print(new_conditions)

# Make predictions for new conditions
new_predictions = model.predict(new_conditions)

print("\n--- Predicted CO₂ Levels ---")
prediction_df = pd.DataFrame({
    'Scenario': ['Low occupancy (5 people)', 'Medium occupancy (8 people)', 'High occupancy (12 people)'],
    'Predicted CO₂ (ppm)': new_predictions,
    'Status': ['Acceptable' if pred < 600 else 'Elevated' if pred < 800 else 'High' 
               for pred in new_predictions]
})
print(prediction_df.to_string(index=False))

# ============================================================================
# 11. FINAL SUMMARY AND RECOMMENDATIONS
# ============================================================================
print("\n" + "=" * 80)
print("STEP 10: MODEL SUMMARY AND RECOMMENDATIONS")
print("=" * 80)

print("\n--- MODEL PERFORMANCE SUMMARY ---")
print(f"""
The Multiple Linear Regression model achieved the following results:

TRAINING PERFORMANCE:
  • R² Score: {train_r2:.4f} ({train_r2*100:.2f}% variance explained)
  • MAE: {train_mae:.4f} ppm (average error)
  • RMSE: {train_rmse:.4f} ppm (typical error magnitude)

TESTING PERFORMANCE:
  • R² Score: {test_r2:.4f} ({test_r2*100:.2f}% variance explained)
  • MAE: {test_mae:.4f} ppm (average error)
  • RMSE: {test_rmse:.4f} ppm (typical error magnitude)
""")

# Evaluate model suitability
print("--- MODEL SUITABILITY ASSESSMENT ---")
model_quality = test_r2

if model_quality >= 0.9:
    suitability = "✓ EXCELLENT - Highly suitable for predictions"
    explanation = "The model explains >90% of variance. Strong predictions possible."
elif model_quality >= 0.8:
    suitability = "✓ GOOD - Suitable for predictions"
    explanation = "The model explains >80% of variance. Generally reliable predictions."
elif model_quality >= 0.7:
    suitability = "◐ MODERATE - Moderately suitable"
    explanation = "The model explains >70% of variance. Use with caution."
elif model_quality >= 0.6:
    suitability = "△ FAIR - Limited suitability"
    explanation = "The model explains 60-70% of variance. May need improvements."
else:
    suitability = "✗ POOR - Not recommended"
    explanation = "The model explains <60% of variance. Needs significant improvements."

print(f"\nAssessment: {suitability}")
print(f"Reason: {explanation}")

print("\n--- KEY FINDINGS ---")
top_feature = coef_df.iloc[0]
print(f"""
1. STRONGEST INFLUENCER: {top_feature['Feature']}
   • Coefficient: {top_feature['Coefficient']:.4f}
   • This feature has the most significant impact on CO₂ levels

2. MODEL ACCURACY:
   • Average prediction error: ±{test_mae:.2f} ppm
   • This means predictions are typically within ±{test_mae:.2f} ppm of actual values

3. PREDICTION CONFIDENCE:
   • The model explains {test_r2*100:.1f}% of CO₂ variation
   • {100-test_r2*100:.1f}% of variation is due to unmeasured factors
""")

print("--- RECOMMENDATIONS ---")
print("""
1. USE THE MODEL FOR:
   • Estimating CO₂ levels under various occupancy and ventilation conditions
   • Identifying which factors have the strongest influence on CO₂
   • Making operational decisions about ventilation rates

2. LIMITATIONS:
   • Model assumes linear relationships between features and CO₂
   • Performance may vary with data outside the training range
   • Other unmeasured factors may influence CO₂ levels

3. IMPROVEMENTS:
   • Collect more diverse data (different times, seasons, conditions)
   • Consider non-linear models (polynomial regression, random forest)
   • Include additional features (air exchange rate, HVAC settings, etc.)
   • Implement real-time model updates with new data
""")

print("\n" + "=" * 80)
print("PIPELINE EXECUTION COMPLETED SUCCESSFULLY!")
print("=" * 80 + "\n")
