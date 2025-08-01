const express = require("express");
const router = express.Router();
const examController = require("../controllers/exam.controller");
const { ensureAuthenticated, authorizeRole } = require("../middlewares/auth.middleware");

// Admin Routes
router.get("/create", ensureAuthenticated, authorizeRole("admin"), examController.renderCreateForm);
router.post("/create", ensureAuthenticated, authorizeRole("admin"), examController.createExam);
router.get("/list", ensureAuthenticated, authorizeRole("admin", "superadmin"), examController.listExams);
router.get("/view/:examId", ensureAuthenticated, authorizeRole("admin", "superadmin"), examController.viewExam);
router.get("/toggle/:id", ensureAuthenticated, authorizeRole("admin", "superadmin"), examController.toggleExamStatus);
router.post("/delete/:examId", ensureAuthenticated, authorizeRole("admin", "superadmin"), examController.deleteExam);
router.get("/results/:examId", ensureAuthenticated, authorizeRole("admin", "superadmin"), examController.viewExamResults);
router.post("/results/toggle/:examId", ensureAuthenticated, authorizeRole("admin", "superadmin"), examController.toggleExamResultVisibility);
router.get(
  "/result/view/:attemptId",
  ensureAuthenticated,
  authorizeRole("admin", "superadmin"),
  examController.viewStudentResult
);



// Student Routes
router.get("/student/active", ensureAuthenticated, authorizeRole("student"), examController.listActiveExams);
router.get("/start/:id", ensureAuthenticated, authorizeRole("student"), examController.startExam);
router.post("/submit/:id", ensureAuthenticated, authorizeRole("student"), examController.submitExam);
router.get("/result/:id", ensureAuthenticated, authorizeRole("student"), examController.showResult);
// Confirmation route after submitting the exam
router.get("/result/confirmation", ensureAuthenticated, authorizeRole("student"),examController.submitExam);

module.exports = router;
