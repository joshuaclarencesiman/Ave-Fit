const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { getWorkouts, getCategories, createWorkout, updateWorkout, deleteWorkout, getWorkoutPlans, createWorkoutPlan, deleteWorkoutPlan, getMemberSessions, assignSessionToMember, deleteAssignedSession } = require("../controllers/workoutController");

router.get("/categories", verifyToken, getCategories);
router.get("/plans", verifyToken, getWorkoutPlans);
router.post("/plans", verifyToken, createWorkoutPlan);
router.delete("/plans/:id", verifyToken, deleteWorkoutPlan);
router.get("/member/:userId", verifyToken, getMemberSessions);
router.post("/assign", verifyToken, assignSessionToMember);
router.delete("/session/:sessionId", verifyToken, deleteAssignedSession);
router.get("/", verifyToken, getWorkouts);
router.post("/", verifyToken, createWorkout);
router.put("/:id", verifyToken, updateWorkout);
router.delete("/:id", verifyToken, deleteWorkout);

module.exports = router;