const express = require("express");
const router = express.Router();
const axios = require("axios");
const Accident = require("../models/Accident");

const ML_API_URL = process.env.ML_API_URL || "http://localhost:5001";

// POST /api/predict/live
router.post("/live", async (req, res) => {
  try {
    const { lat, lng, name } = req.body;

    // Forward the geocoordinates to the Python Live Scan orchestrator
    const mlResponse = await axios.post(`${ML_API_URL}/live_scan`, { lat, lng, name }, {
      timeout: 20000, // Slightly longer timeout to allow Python to call external APIs
    });

    res.json(mlResponse.data);
  } catch (err) {
    if (err.code === "ECONNREFUSED" || err.code === "ECONNRESET") {
      return res.status(503).json({
        success: false,
        error: "ML Telemetry API is offline. Models unresponsive.",
      });
    }
    console.error("❌ Live Scan error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/predict
router.post("/", async (req, res) => {
  try {
    const inputData = req.body;

    // Call ML FastAPI microservice
    const mlResponse = await axios.post(`${ML_API_URL}/predict`, inputData, {
      timeout: 15000,
    });

    const predictionResult = mlResponse.data;

    // Save to MongoDB (non-blocking) using standardized Pune schema
    const record = new Accident({
      hour: inputData.hour,
      day_of_week: inputData.day_of_week,
      is_weekend: inputData.is_weekend || 0,
      road_type: inputData.road_type,
      lanes: inputData.lanes || 2,
      traffic_signal: inputData.traffic_signal || 1,
      weather: inputData.weather,
      visibility: inputData.visibility || 2,
      temperature: inputData.temperature || 25,
      humidity: inputData.humidity || 50,
      traffic_density: inputData.traffic_density || 2,
      vehicles_involved: inputData.vehicles_involved || 1,
      vehicle_type: inputData.vehicle_type || 2,
      lighting_condition: inputData.lighting_condition || 1,
      road_surface_cond: inputData.road_surface_cond || 1,
      casualties: inputData.casualties || 0,
      is_peak_hour: inputData.is_peak_hour || 0,
      is_drunk_driving: inputData.is_drunk_driving || 0,
      risk_score: inputData.risk_score || 0.5,

      predicted_severity: predictionResult.severity,
      severity_code: predictionResult.severity_code,
      confidence: predictionResult.confidence,
      probabilities: predictionResult.probabilities,
      safety_suggestion: predictionResult.safety_suggestion,
      top_risk_factors: predictionResult.top_risk_factors,
      location: inputData.location || "Pune",
    });
    record.save().catch((err) => console.log("⚠️  MongoDB save skipped:", err.message));

    res.json({
      success: true,
      prediction: predictionResult,
      saved: true,
    });
  } catch (err) {
    if (err.code === "ECONNREFUSED" || err.code === "ECONNRESET") {
      return res.status(503).json({
        success: false,
        error: "ML API is offline. Please run: cd ml && uvicorn src.api:app --port 5001",
      });
    }
    console.error("❌ Prediction error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
