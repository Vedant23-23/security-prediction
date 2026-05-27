import pandas as pd
import json

df = pd.read_csv('ml/data/raw/indian_roads_dataset.csv')
info = {
    'weather': df['weather'].dropna().unique().tolist(),
    'road_type': df['road_type'].dropna().unique().tolist(),
    'visibility': df['visibility'].dropna().unique().tolist(),
    'traffic_density': df['traffic_density'].dropna().unique().tolist(),
    'day_of_week': df['day_of_week'].dropna().unique().tolist(),
    'accident_severity': df['accident_severity'].dropna().unique().tolist()
}

with open('ml/data/raw/unique_vals.json', 'w') as f:
    json.dump(info, f, indent=4)
print("Done")
