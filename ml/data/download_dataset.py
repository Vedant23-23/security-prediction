"""
download_dataset.py
===================
Downloads the REAL Chicago Traffic Crashes Dataset (~800k records, updated daily).
Source: City of Chicago Data Portal
URL: https://data.cityofchicago.org/api/views/85ca-t3if/rows.csv?accessType=DOWNLOAD

Usage:
    python data/download_dataset.py
"""

import os
import requests
import pandas as pd
from tqdm import tqdm

RAW_DIR = os.path.join(os.path.dirname(__file__), "raw")
os.makedirs(RAW_DIR, exist_ok=True)

# Chicago Traffic Crashes - direct CSV download
DATASET_URL = "https://data.cityofchicago.org/api/views/85ca-t3if/rows.csv?accessType=DOWNLOAD"

def download_chicago_dataset():
    """Download the real Chicago crash dataset."""
    dest_path = os.path.join(RAW_DIR, "chicago_crashes.csv")
    
    print("="*60)
    print("🚦 Downloading REAL Chicago Traffic Crashes Dataset...")
    print("   Source: data.cityofchicago.org")
    print("   Note: This is a large dataset (~200MB). Please wait...")
    print("="*60)

    try:
        response = requests.get(DATASET_URL, stream=True, timeout=120)
        response.raise_for_status()
        
        # City of Chicago portal doesn't always send content-length, we handle both
        total_size = int(response.headers.get("content-length", 0))
        
        with open(dest_path, "wb") as f, tqdm(
            total=total_size if total_size > 0 else None, 
            unit="B", unit_scale=True, 
            desc="Downloading"
        ) as bar:
            for chunk in response.iter_content(chunk_size=65536):
                f.write(chunk)
                if total_size > 0:
                    bar.update(len(chunk))
                else:
                    bar.update(len(chunk))
                    
        print(f"\n✅ Successfully downloaded real dataset to: {dest_path}")
        
        # Quick validation
        df = pd.read_csv(dest_path, low_memory=False, usecols=["POSTED_SPEED_LIMIT", "MOST_SEVERE_INJURY"])
        print(f"📊 Dataset size: {len(df):,} accident records")
        
        return True
    except Exception as e:
        print(f"\n❌ Download failed: {e}")
        return False

def main():
    success = download_chicago_dataset()
    if success:
        print("\n🚀 Next step: Run 'python src/preprocess.py' to clean and scale the real data.")
    else:
        print("\n⚠️ Failed to download the dataset. Check your internet connection.")

if __name__ == "__main__":
    main()
