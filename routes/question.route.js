const express = require("express");
const router = express.Router();
const { ensureAuthenticated, authorizeRole } = require("../middlewares/auth.middleware");
const questionController = require("../controllers/question.controller");

// Admin routes
router.get("/add/:examId", ensureAuthenticated, authorizeRole("admin"), questionController.renderAddForm);
router.post("/add/:examId", ensureAuthenticated, authorizeRole("admin"), questionController.addQuestion);

router.get("/list/:examId", ensureAuthenticated, authorizeRole("admin"), questionController.listQuestions);

router.get("/edit/:questionId", ensureAuthenticated, authorizeRole("admin"), questionController.renderEditForm);
router.post("/update/:questionId", ensureAuthenticated, authorizeRole("admin"), questionController.updateQuestion);

router.post("/delete/:questionId", ensureAuthenticated, authorizeRole("admin"), questionController.deleteQuestion);
router.post("/complete/:examId", ensureAuthenticated, authorizeRole("admin"), questionController.completeExam);

module.exports = router; 
