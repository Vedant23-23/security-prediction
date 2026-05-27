"""
train.py
========
Train Random Forest + XGBoost + Neural Network ensemble for
Road Accident Severity Prediction.

Usage:
    python src/train.py

Output:
    ml/models/random_forest_model.pkl
    ml/models/xgboost_model.pkl
    ml/models/neural_network_model.h5
    ml/models/ensemble_model.pkl
"""

import os
import sys
import time
import joblib
import numpy as np

# ── Paths ──────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROC_DIR = os.path.join(BASE_DIR, "data", "processed")
MODEL_DIR = os.path.join(BASE_DIR, "models")
REPORT_DIR = os.path.join(BASE_DIR, "reports")

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)

# ── Lazy imports (after path setup) ────────────────────────────────
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb

print("=" * 60)
print("  Road Accident Severity Prediction — Model Training")
print("=" * 60)

# ── 1. Load preprocessed data ──────────────────────────────────────
def load_data():
    required = ["X_train.npy", "y_train.npy", "X_test.npy", "y_test.npy"]
    for f in required:
        if not os.path.exists(os.path.join(PROC_DIR, f)):
            print("❌ Preprocessed data not found. Run: python src/preprocess.py")
            sys.exit(1)

    X_train = np.load(os.path.join(PROC_DIR, "X_train.npy"))
    y_train = np.load(os.path.join(PROC_DIR, "y_train.npy"))
    X_test  = np.load(os.path.join(PROC_DIR, "X_test.npy"))
    y_test  = np.load(os.path.join(PROC_DIR, "y_test.npy"))

    print(f"\n📊 Training samples : {X_train.shape[0]:,}")
    print(f"   Test samples     : {X_test.shape[0]:,}")
    print(f"   Features         : {X_train.shape[1]}")
    return X_train, y_train, X_test, y_test


# ── 2. Random Forest ───────────────────────────────────────────────
def train_random_forest(X_train, y_train, X_test, y_test):
    print("\n🌲 [1/3] Training Random Forest Classifier...")
    t0 = time.time()

    rf = RandomForestClassifier(
        n_estimators=500,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        max_features="sqrt",
        class_weight="balanced",
        n_jobs=-1,
        random_state=42,
        verbose=0,
    )
    rf.fit(X_train, y_train)
    elapsed = time.time() - t0

    y_pred = rf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"   ✅ Done in {elapsed:.1f}s | Test Accuracy: {acc*100:.2f}%")

    # Save
    rf_path = os.path.join(MODEL_DIR, "random_forest_model.pkl")
    joblib.dump(rf, rf_path)
    print(f"   💾 Saved → {rf_path}")

    # Save feature importances
    feat_names = joblib.load(os.path.join(MODEL_DIR, "feature_names.pkl"))
    fi = dict(zip(feat_names, rf.feature_importances_))
    fi_sorted = dict(sorted(fi.items(), key=lambda x: x[1], reverse=True))
    joblib.dump(fi_sorted, os.path.join(MODEL_DIR, "feature_importances.pkl"))
    print(f"   📈 Top features: {list(fi_sorted.keys())[:5]}")

    return rf, acc


# ── 3. XGBoost ─────────────────────────────────────────────────────
def train_xgboost(X_train, y_train, X_test, y_test):
    print("\n⚡ [2/3] Training XGBoost Classifier...")
    t0 = time.time()

    # XGBoost needs 0-indexed labels
    y_train_xgb = y_train - 1
    y_test_xgb  = y_test  - 1

    xgb_model = xgb.XGBClassifier(
        n_estimators=500,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42,
        n_jobs=-1,
        verbosity=0,
    )
    xgb_model.fit(
        X_train, y_train_xgb,
        eval_set=[(X_test, y_test_xgb)],
        verbose=False,
    )
    elapsed = time.time() - t0

    y_pred_xgb = xgb_model.predict(X_test) + 1  # restore original labels
    acc = accuracy_score(y_test, y_pred_xgb)
    print(f"   ✅ Done in {elapsed:.1f}s | Test Accuracy: {acc*100:.2f}%")

    # Save
    xgb_path = os.path.join(MODEL_DIR, "xgboost_model.pkl")
    joblib.dump(xgb_model, xgb_path)
    print(f"   💾 Saved → {xgb_path}")

    return xgb_model, acc


# ── 4. Neural Network (Keras) ──────────────────────────────────────
def train_neural_network(X_train, y_train, X_test, y_test):
    print("\n🧠 [3/3] Training Neural Network (TensorFlow/Keras)...")

    try:
        import tensorflow as tf
        from tensorflow import keras
        from tensorflow.keras import layers

        tf.get_logger().setLevel("ERROR")
        t0 = time.time()

        # Convert to 0-indexed
        y_train_nn = y_train - 1
        y_test_nn  = y_test  - 1
        n_features = X_train.shape[1]

        model = keras.Sequential([
            layers.Input(shape=(n_features,)),
            layers.Dense(128, activation="relu"),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            layers.Dense(256, activation="relu"),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            layers.Dense(128, activation="relu"),
            layers.BatchNormalization(),
            layers.Dropout(0.2),
            layers.Dense(64, activation="relu"),
            layers.Dense(3, activation="softmax"),
        ])

        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss="sparse_categorical_crossentropy",
            metrics=["accuracy"],
        )

        callbacks = [
            keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True),
            keras.callbacks.ReduceLROnPlateau(patience=5, factor=0.5),
        ]

        history = model.fit(
            X_train, y_train_nn,
            validation_data=(X_test, y_test_nn),
            epochs=100,
            batch_size=256,
            callbacks=callbacks,
            verbose=1,
        )
        elapsed = time.time() - t0

        y_pred_nn = np.argmax(model.predict(X_test, verbose=0), axis=1) + 1
        acc = accuracy_score(y_test, y_pred_nn)
        print(f"   ✅ Done in {elapsed:.1f}s | Test Accuracy: {acc*100:.2f}%")

        nn_path = os.path.join(MODEL_DIR, "neural_network_model.keras")
        model.save(nn_path)
        print(f"   💾 Saved → {nn_path}")

        return model, acc, True

    except ImportError:
        print("   ⚠️  TensorFlow not installed — skipping Neural Network.")
        return None, 0.0, False


# ── 5. Ensemble (sklearn VotingClassifier wrapper) ─────────────────
class NNWrapper:
    """Wraps Keras model to work with sklearn VotingClassifier."""
    def __init__(self, model):
        self.model = model
        self.classes_ = np.array([1, 2, 3])

    def predict_proba(self, X):
        return self.model.predict(X, verbose=0)

    def predict(self, X):
        return np.argmax(self.predict_proba(X), axis=1) + 1


def create_ensemble(rf, xgb_model, nn_model=None):
    print("\n🎯 Building Soft-Voting Ensemble...")
    # For ensemble we wrap xgb to output original labels
    from sklearn.base import BaseEstimator, ClassifierMixin

    class XGBWrap(BaseEstimator, ClassifierMixin):
        def __init__(self, model):
            self.model = model
            self.classes_ = np.array([1, 2, 3])

        def fit(self, X, y): return self
        def predict(self, X): return self.model.predict(X) + 1
        def predict_proba(self, X): return self.model.predict_proba(X)

    estimators = [("rf", rf), ("xgb", XGBWrap(xgb_model))]
    if nn_model is not None:
        estimators.append(("nn", NNWrapper(nn_model)))

    # Save ensemble as dict of models + weights
    ensemble = {
        "rf": rf,
        "xgb": xgb_model,
        "nn": nn_model,
        "weights": [0.35, 0.35, 0.30] if nn_model else [0.50, 0.50],
    }
    ens_path = os.path.join(MODEL_DIR, "ensemble_model.pkl")
    joblib.dump(ensemble, ens_path)
    print(f"   💾 Saved → {ens_path}")
    return ensemble


# ── 6. Print final summary ─────────────────────────────────────────
def print_summary(rf_acc, xgb_acc, nn_acc, has_nn):
    print("\n" + "=" * 60)
    print("  TRAINING COMPLETE — Summary")
    print("=" * 60)
    print(f"  Random Forest     : {rf_acc*100:.2f}%")
    print(f"  XGBoost           : {xgb_acc*100:.2f}%")
    if has_nn:
        print(f"  Neural Network    : {nn_acc*100:.2f}%")
        ens_approx = (rf_acc + xgb_acc + nn_acc) / 3
    else:
        ens_approx = (rf_acc + xgb_acc) / 2
    print(f"  Ensemble (approx) : {ens_approx*100:.2f}%")
    print("=" * 60)
    print("\n🚀 Run 'python src/evaluate.py' to generate full report.")
    print("🚀 Run 'uvicorn src.api:app --port 5001' to start ML API.")


def main():
    X_train, y_train, X_test, y_test = load_data()

    rf,  rf_acc  = train_random_forest(X_train, y_train, X_test, y_test)
    xgb_m, xgb_acc = train_xgboost(X_train, y_train, X_test, y_test)
    nn,  nn_acc, has_nn = train_neural_network(X_train, y_train, X_test, y_test)

    create_ensemble(rf, xgb_m, nn if has_nn else None)
    print_summary(rf_acc, xgb_acc, nn_acc, has_nn)


if __name__ == "__main__":
    main()
