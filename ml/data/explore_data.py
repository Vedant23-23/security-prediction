import pandas as pd
import json

try:
    df = pd.read_csv('ml/data/raw/indian_roads_dataset.csv')
    info = {
        'columns': df.columns.tolist(),
        'dtypes': {k: str(v) for k,v in df.dtypes.items()},
        'sample': df.head(1).to_dict('records')[0],
        'target_unique_severity': df['severity'].unique().tolist() if 'severity' in df.columns else None,
        'target_unique_severity_type': df['severity_type'].unique().tolist() if 'severity_type' in df.columns else None,
        'target_unique_accident_severity': df['accident_severity'].unique().tolist() if 'accident_severity' in df.columns else None
    }

    with open('ml/data/raw/dataset_info.json', 'w') as f:
        json.dump(info, f, indent=4)
    print("Success")
except Exception as e:
    print(f"Error: {e}")
