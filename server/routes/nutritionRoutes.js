const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { getNutritionPlans, createNutritionPlan, updateNutritionPlan, deleteNutritionPlan, getNutritionSummary } = require("../controllers/nutritionController");

router.get("/summary", verifyToken, getNutritionSummary);
router.get("/", verifyToken, getNutritionPlans);
router.post("/", verifyToken, createNutritionPlan);
router.put("/:id", verifyToken, updateNutritionPlan);
router.delete("/:id", verifyToken, deleteNutritionPlan);

module.exports = router;