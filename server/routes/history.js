const express = require("express");
const router = express.Router();
const Accident = require("../models/Accident");

// GET /api/history?page=1&limit=20
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Accident.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Accident.countDocuments(),
    ]);

    res.json({
      success: true,
      data: records,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}); 0

// DELETE /api/history/:id
router.delete("/:id", async (req, res) => {
  try {
    await Accident.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Record deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
