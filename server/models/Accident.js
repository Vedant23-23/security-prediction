const mongoose = require("mongoose");

const accidentSchema = new mongoose.Schema(
  {
    // Input Features (Aligned with Pune Dataset / ML Schema)
    hour:               { type: Number, required: true },
    day_of_week:        { type: Number, required: true },
    is_weekend:         { type: Number, default: 0 },
    road_type:          { type: Number, required: true }, // 1=Highway, 2=Urban, 3=Rural
    lanes:              { type: Number, default: 2 },
    traffic_signal:     { type: Number, default: 1 },
    weather:            { type: Number, required: true }, // 1=Clear, 2=Rain, 3=Fog
    visibility:         { type: Number, default: 2 },     // 1=Low, 2=Med, 3=High
    temperature:        { type: Number, default: 25 },
    humidity:           { type: Number, default: 50 },
    traffic_density:    { type: Number, default: 2 },     // 1=Low, 2=Med, 3=High
    vehicles_involved:  { type: Number, default: 2 },
    vehicle_type:       { type: Number, default: 2 },     // 1=Heavy, 2=Car, 3=Motorcycle
    lighting_condition: { type: Number, default: 1 },     // 1=Day, 2=Night, 3=Dusk/Dawn
    road_surface_cond:  { type: Number, default: 1 },     // 1=Dry, 2=Wet, 3=Muddy
    casualties:         { type: Number, default: 0 },
    is_peak_hour:       { type: Number, default: 0 },
    is_drunk_driving:   { type: Number, default: 0 },
    risk_score:         { type: Number, default: 0.5 },

    // Prediction Result (From ML Ensemble)
    predicted_severity: { type: String, enum: ["Fatal", "Major", "Minor"] },
    severity_code:      { type: Number, enum: [1, 2, 3] },
    confidence:         { type: Number },
    probabilities:      { type: mongoose.Schema.Types.Mixed },
    safety_suggestion:  { type: String },
    top_risk_factors:   [{ type: String }],

    // Metadata
    timestamp: { type: Date, default: Date.now },
    location:  { type: String, default: "Pune" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Accident", accidentSchema);
