"""
preprocess.py
=============
Processes the Indian Road Accident Dataset and maps its string features 
into the standardized numerical codes used by the ML models and UI.
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
from collections import Counter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_PATH = os.path.join(BASE_DIR, "data", "raw", "indian_roads_dataset.csv")
PROC_DIR = os.path.join(BASE_DIR, "data", "processed")
MODEL_DIR = os.path.join(BASE_DIR, "models")

os.makedirs(PROC_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

# Define final ordered feature columns
FEATURE_COLS = [
    "hour", "day_of_week", "is_weekend", "road_type", "lanes",
    "traffic_signal", "weather", "visibility", "temperature", "humidity",
    "traffic_density", "vehicles_involved", "vehicle_type", "lighting_condition",
    "road_surface_cond", "casualties", "is_peak_hour", "is_drunk_driving", "risk_score"
]

TARGET_COL = "accident_severity"

def clean_and_map_pune(df: pd.DataFrame) -> pd.DataFrame:
    print("🧹 Cleaning and mapping Pune dataset values to UI numerical codes...")
    mapped = pd.DataFrame()

    # 1. Target: Severity (Fatal=1, Major=2, Minor=3)
    sev_map = {'fatal': 1, 'major': 2, 'minor': 3}
    mapped[TARGET_COL] = df['accident_severity'].map(sev_map)

    # 2. Features mapping
    # hour: numeric
    mapped["hour"] = df["hour"].fillna(12).clip(lower=0, upper=23)
    
    # day_of_week
    day_map = {
        'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 
        'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7
    }
    mapped["day_of_week"] = df["day_of_week"].map(day_map).fillna(1)
    
    # is_weekend
    mapped["is_weekend"] = df["is_weekend"].fillna(0)
    
    # road_type
    rt_map = {'highway': 1, 'urban': 2, 'rural': 3}
    mapped["road_type"] = df["road_type"].map(rt_map).fillna(2)
    
    # lanes
    mapped["lanes"] = df["lanes"].fillna(2).clip(lower=1, upper=6)
    
    # traffic_signal
    mapped["traffic_signal"] = df["traffic_signal"].fillna(1)
    
    # weather
    we_map = {'clear': 1, 'rain': 2, 'fog': 3}
    mapped["weather"] = df["weather"].map(we_map).fillna(1)
    
    # visibility
    vis_map = {'low': 1, 'medium': 2, 'high': 3}
    mapped["visibility"] = df["visibility"].map(vis_map).fillna(2)
    
    # temperature & humidity
    mapped["temperature"] = df["temperature"].fillna(30)
    mapped["humidity"] = df["humidity"].fillna(50)
    
    # traffic_density
    td_map = {'low': 1, 'medium': 2, 'high': 3}
    mapped["traffic_density"] = df["traffic_density"].map(td_map).fillna(2)
    
    # vehicles_involved
    mapped["vehicles_involved"] = df["vehicles_involved"].fillna(2).clip(lower=1, upper=15)
    
    # vehicle_type
    vt_map = {'heavy': 1, 'light': 2, 'two_wheeler': 3, 'commercial': 4}
    mapped["vehicle_type"] = df["vehicle_type"].map(vt_map).fillna(2)
    
    # lighting_condition
    lc_map = {'daylight': 1, 'night_lit': 2, 'night_unlit': 3, 'dusk_dawn': 4}
    mapped["lighting_condition"] = df["lighting_condition"].map(lc_map).fillna(1)
    
    # road_surface_cond
    rs_map = {'dry': 1, 'wet': 2, 'damaged': 3, 'muddy': 4}
    mapped["road_surface_cond"] = df["road_surface_cond"].map(rs_map).fillna(1)
    
    # casualties
    mapped["casualties"] = df["casualties"].fillna(0).clip(upper=25)
    
    # is_peak_hour
    mapped["is_peak_hour"] = df["is_peak_hour"].fillna(0)
    
    # is_drunk_driving
    mapped["is_drunk_driving"] = df["is_drunk_driving"].fillna(0)
    
    # risk_score
    mapped["risk_score"] = df["risk_score"].fillna(0.5)

    # Drop null targets just in case
    mapped = mapped.dropna(subset=[TARGET_COL])
    return mapped

def preprocess():
    if not os.path.exists(RAW_PATH):
        print(f"❌ Real dataset not found at {RAW_PATH}.")
        sys.exit(1)

    print(f"📂 Loading heavy real dataset: {RAW_PATH}")
    df_raw = pd.read_csv(RAW_PATH)
    print(f"   Raw loaded: {len(df_raw):,} rows.")

    df_feat = clean_and_map_pune(df_raw)

    X = df_feat[FEATURE_COLS].values
    y = df_feat[TARGET_COL].astype(int).values

    print(f"   Severity mapping distribution: {dict(Counter(y))}")
    
    if len(X) > 300000:
        print("   Dataset very large. Stratified subsampling to 300k records for memory safety.")
        _, X, _, y = train_test_split(X, y, test_size=300000/len(X), stratify=y, random_state=42)

    print("📏 Scaling features...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))
    joblib.dump(FEATURE_COLS, os.path.join(MODEL_DIR, "feature_names.pkl"))

    print("✂️  Splitting train/test (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)

    print("⚖️  Applying SMOTE for strict class balancing...")
    smote = SMOTE(random_state=42, k_neighbors=5)
    X_train_bal, y_train_bal = smote.fit_resample(X_train, y_train)
    print(f"   Final balanced targets:  {dict(Counter(y_train_bal))}")

    np.save(os.path.join(PROC_DIR, "X_train.npy"), X_train_bal)
    np.save(os.path.join(PROC_DIR, "y_train.npy"), y_train_bal)
    np.save(os.path.join(PROC_DIR, "X_test.npy"), X_test)
    np.save(os.path.join(PROC_DIR, "y_test.npy"), y_test)

    print(f"\n✅ Pipeline ready! Processed {len(X_train_bal)} balanced real records.")

if __name__ == "__main__":
    preprocess()
