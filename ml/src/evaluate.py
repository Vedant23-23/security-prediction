"""
evaluate.py
===========
Generate full evaluation metrics, confusion matrix, ROC curves,
and feature importance plots for all trained models.

Usage:
    python src/evaluate.py
"""

import os
import sys
import joblib
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    roc_auc_score, roc_curve
)
from sklearn.preprocessing import label_binarize

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROC_DIR = os.path.join(BASE_DIR, "data", "processed")
MODEL_DIR = os.path.join(BASE_DIR, "models")
REPORT_DIR = os.path.join(BASE_DIR, "reports")
os.makedirs(REPORT_DIR, exist_ok=True)

CLASSES = ["Fatal (1)", "Serious (2)", "Slight (3)"]
LABELS = [1, 2, 3]

sns.set_theme(style="darkgrid", palette="deep")

 

def load():
    X_test = np.load(os.path.join(PROC_DIR, "X_test.npy"))
    y_test  = np.load(os.path.join(PROC_DIR, "y_test.npy"))
    rf_model = joblib.load(os.path.join(MODEL_DIR, "random_forest_model.pkl"))
    feat_names = joblib.load(os.path.join(MODEL_DIR, "feature_names.pkl"))
    return X_test, y_test, rf_model, feat_names


def plot_confusion_matrix(y_test, y_pred, title, filename):
    cm = confusion_matrix(y_test, y_pred, labels=LABELS)
    fig, ax = plt.subplots(figsize=(8, 6))
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues",
        xticklabels=CLASSES, yticklabels=CLASSES, ax=ax
    )
    ax.set_xlabel("Predicted Label", fontsize=13)
    ax.set_ylabel("True Label", fontsize=13)
    ax.set_title(title, fontsize=15, fontweight="bold")
    plt.tight_layout()
    path = os.path.join(REPORT_DIR, filename)
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"   📊 Saved: {path}")


def plot_feature_importance(feat_names):
    try:
        fi = joblib.load(os.path.join(MODEL_DIR, "feature_importances.pkl"))
    except FileNotFoundError:
        print("⚠️  feature_importances.pkl not found — run train.py first")
        return

    fig, ax = plt.subplots(figsize=(10, 7))
    items = list(fi.items())[:15]  # top 15
    names = [i[0].replace("_", " ") for i in items]
    vals  = [i[1] for i in items]
    colors = plt.cm.RdYlGn_r(np.linspace(0.1, 0.9, len(vals)))
    bars = ax.barh(names[::-1], vals[::-1], color=colors[::-1])
    ax.set_xlabel("Importance Score", fontsize=13)
    ax.set_title("Random Forest — Feature Importance", fontsize=15, fontweight="bold")
    ax.bar_label(bars, fmt="%.3f", padding=4, fontsize=10)
    plt.tight_layout()
    path = os.path.join(REPORT_DIR, "feature_importance.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"   📊 Saved: {path}")


def plot_roc_curves(y_test, y_prob_rf):
    y_bin = label_binarize(y_test, classes=LABELS)
    fig, ax = plt.subplots(figsize=(8, 6))
    colors = ["#e74c3c", "#f39c12", "#2ecc71"]
    for i, (cls, col) in enumerate(zip(CLASSES, colors)):
        fpr, tpr, _ = roc_curve(y_bin[:, i], y_prob_rf[:, i])
        auc = roc_auc_score(y_bin[:, i], y_prob_rf[:, i])
        ax.plot(fpr, tpr, color=col, lw=2, label=f"{cls} (AUC={auc:.3f})")

    ax.plot([0, 1], [0, 1], "k--", lw=1)
    ax.set_xlabel("False Positive Rate", fontsize=13)
    ax.set_ylabel("True Positive Rate", fontsize=13)
    ax.set_title("ROC Curves — Random Forest", fontsize=15, fontweight="bold")
    ax.legend(fontsize=11)
    plt.tight_layout()
    path = os.path.join(REPORT_DIR, "roc_curve.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"   📊 Saved: {path}")


def main():
    print("=" * 60)
    print("  Road Accident Severity Prediction — Evaluation")
    print("=" * 60)

    X_test, y_test, rf_model, feat_names = load()

    # ── Random Forest ──────────────────────────────────────────
    print("\n🌲 Random Forest Evaluation:")
    y_pred_rf   = rf_model.predict(X_test)
    y_prob_rf   = rf_model.predict_proba(X_test)
    acc_rf      = accuracy_score(y_test, y_pred_rf)
    report_rf   = classification_report(y_test, y_pred_rf, target_names=CLASSES)
    print(f"   Accuracy: {acc_rf*100:.2f}%")
    print(report_rf)

    plot_confusion_matrix(y_test, y_pred_rf, "Confusion Matrix — Random Forest", "confusion_matrix_rf.png")
    plot_roc_curves(y_test, y_prob_rf)
    plot_feature_importance(feat_names)

    # ── XGBoost ────────────────────────────────────────────────
    xgb_path = os.path.join(MODEL_DIR, "xgboost_model.pkl")
    if os.path.exists(xgb_path):
        import xgboost as xgb
        print("\n⚡ XGBoost Evaluation:")
        xgb_model = joblib.load(xgb_path)
        y_pred_xgb = xgb_model.predict(X_test) + 1
        acc_xgb    = accuracy_score(y_test, y_pred_xgb)
        report_xgb = classification_report(y_test, y_pred_xgb, target_names=CLASSES)
        print(f"   Accuracy: {acc_xgb*100:.2f}%")
        print(report_xgb)
        plot_confusion_matrix(y_test, y_pred_xgb, "Confusion Matrix — XGBoost", "confusion_matrix_xgb.png")
    else:
        acc_xgb = 0

    # ── Neural Network ─────────────────────────────────────────
    nn_path = os.path.join(MODEL_DIR, "neural_network_model.keras")
    acc_nn = 0
    if os.path.exists(nn_path):
        try:
            import tensorflow as tf
            tf.get_logger().setLevel("ERROR")
            nn_model = tf.keras.models.load_model(nn_path)
            print("\n🧠 Neural Network Evaluation:")
            y_pred_nn = np.argmax(nn_model.predict(X_test, verbose=0), axis=1) + 1
            acc_nn    = accuracy_score(y_test, y_pred_nn)
            report_nn = classification_report(y_test, y_pred_nn, target_names=CLASSES)
            print(f"   Accuracy: {acc_nn*100:.2f}%")
            print(report_nn)
        except Exception as e:
            print(f"   ⚠️  Could not load NN: {e}")

    # ── Save Text Report ───────────────────────────────────────
    txt_path = os.path.join(REPORT_DIR, "classification_report.txt")
    with open(txt_path, "w") as f:
        f.write("Road Accident Severity Prediction — Model Evaluation Report\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Random Forest Accuracy : {acc_rf*100:.2f}%\n")
        if acc_xgb: f.write(f"XGBoost Accuracy       : {acc_xgb*100:.2f}%\n")
        if acc_nn:  f.write(f"Neural Network Accuracy: {acc_nn*100:.2f}%\n")
        f.write("\n--- Random Forest Classification Report ---\n")
        f.write(report_rf)
    print(f"\n📄 Full report saved → {txt_path}")

    print("\n✅ Evaluation complete! Check ml/reports/ for all plots.")


if __name__ == "__main__":
    main()
