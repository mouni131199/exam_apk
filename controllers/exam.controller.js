const Exam = require("../models/exam.model");
const Question = require("../models/question.model");
const Attempt = require("../models/attempt.model");
const Student = require("../models/student.model");

// Render Create Exam
exports.renderCreateForm = (req, res) => {
  res.render("exam/create", {
    user: req.user,
  });
};

// Create Exam
exports.createExam = async (req, res) => {
  try {
    const { title, description, numberOfQuestions, author, duration } = req.body;

    const existingExam = await Exam.findOne({ title });
    if (existingExam) {
      req.flash("error", "An exam with this title already exists.");
      return res.redirect("/exam/create");
    }

    const exam = new Exam({
      title,
      description,
      numberOfQuestions,
      author,
      duration: parseInt(duration),
    });

    await exam.save();
    req.flash("success", "Exam created. Now add questions.");
    res.redirect(`/question/add/${exam._id}`);
  } catch (err) {
    console.error("❌ Exam creation error:", err);
    req.flash("error", "Failed to create exam.");
    res.redirect("/exam/create");
  }
};

// List all exams
exports.listExams = async (req, res) => {
  try {
    const exams = await Exam.find({});
    res.render("exam/list", {
      exams,
      user: req.session.user,
      messages: req.flash(),
    });
  } catch (err) {
    console.error("❌ Error listing exams:", err);
    res.status(500).send("Error loading exams.");
  }
};

// Toggle Exam Status
exports.toggleExamStatus = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      req.flash("error", "Exam not found.");
      return res.redirect("/exam/list");
    }

    exam.isActive = !exam.isActive;
    await exam.save();

    req.flash("success", `Exam ${exam.isActive ? "activated" : "deactivated"} successfully.`);
    res.redirect("/exam/list");
  } catch (err) {
    console.error("❌ Toggle error:", err);
    req.flash("error", "Unable to toggle status.");
    res.redirect("/exam/list");
  }
};

// View Exam
exports.viewExam = async (req, res) => {
  try {
    const examId = req.params.examId;
    const exam = await Exam.findById(examId).lean();
    if (!exam) {
      req.flash("error", "Exam not found.");
      return res.redirect("/exam/list");
    }

    const questions = await Question.find({ exam: examId }).lean();
    const attempts = await Attempt.find({ examId }).populate("studentId").lean();

    res.render("exam/view", {
      exam,
      questions,
      attempts,
      user: req.user,
    });
  } catch (err) {
    console.error("❌ View Exam Error:", err);
    req.flash("error", "Unable to view exam.");
    res.redirect("/exam/list");
  }
};

// Delete Exam
exports.deleteExam = async (req, res) => {
  try {
    const examId = req.params.examId;
    await Exam.findByIdAndDelete(examId);
    await Question.deleteMany({ exam: examId });

     // Delete all related attempts
    await Attempt.deleteMany({ examId });

    req.flash("success", "Exam and its questions deleted.");
    res.redirect("/exam/list");
  } catch (err) {
    console.error("❌ Delete Exam Error:", err);
    req.flash("error", "Failed to delete exam.");
    res.redirect("/exam/list");
  }
};

// List only active exams for students
exports.listActiveExams = async (req, res) => {
  try {
    const exams = await Exam.find({ isActive: true });
    const student = await Student.findOne({ email: req.session.user.email });
    const attempts = await Attempt.find({ studentId: student._id }).populate("examId");

    res.render("dashboards/student", {
      user: req.session.user,
      activeExams: exams,
      attempts,
      messages: req.flash(),
    });
  } catch (err) {
    console.error("❌ listActiveExams error:", err);
    res.status(500).send("Failed to load active exams.");
  }
};

// Start Exam
exports.startExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam || !exam.isActive) {
      req.flash("error", "Exam is not available or has been deactivated.");
      return res.redirect("/dashboards/student");
    }

    const student = await Student.findOne({ email: req.session.user.email });
    const priorAttempt = await Attempt.findOne({
      examId: exam._id,
      studentId: student._id,
    });

    if (priorAttempt) {
      req.flash("error", "You have already submitted this exam.");
      return res.redirect("/dashboards/student");
    }

    const questions = await Question.find({ exam: exam._id });

    res.render("exam/start", {
      exam,
      questions,
      error: req.flash("error"),
      success: req.flash("success"),
    });
  } catch (err) {
    console.error("❌ Error starting exam:", err);
    req.flash("error", "Failed to load the exam.");
    res.redirect("/dashboards/student");
  }
};

// Submit Exam
exports.submitExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    const questions = await Question.find({ exam: exam._id });
    const student = await Student.findOne({ email: req.session.user.email });

    const alreadyAttempted = await Attempt.findOne({
      examId: exam._id,
      studentId: student._id,
    });

    if (alreadyAttempted) {
      req.flash("error", "You have already submitted this exam.");
      return res.redirect("/dashboards/student");
    }

    let score = 0;
    const answers = [];

    for (let question of questions) {
      const input = req.body[`q_${question._id}`];
      const selected = Array.isArray(input)
        ? input.map((i) => parseInt(i))
        : input ? [parseInt(input)] : [];

      const isCorrect =
        selected.length === question.correctAnswers.length &&
        selected.every((i) => question.correctAnswers.includes(i));

      if (isCorrect) score++;

      answers.push({
        questionId: question._id,
        selectedOption: selected,
        isCorrect,
      });
    }

    await Attempt.create({
      examId: exam._id,
      studentId: student._id,
      answers,
      score,
      showResult: true,
    });

    req.flash("success", "✅ Your exam response has been submitted.");
    res.render("result/confirmation", {
      user: req.session.user,
    });
  } catch (err) {
    console.error("❌ Exam submission failed:", err);
    req.flash("error", "Something went wrong while submitting your answers.");
    res.redirect("/dashboards/student");
  }
};

// Show Result (Student)
exports.showResult = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate("examId")
      .populate("answers.questionId");

    if (!attempt) {
      req.flash("error", "Attempt not found.");
      return res.redirect("/dashboards/student");
    }

    if (!attempt.examId.showResults) {
      req.flash("error", "Results are not yet visible for this exam.");
      return res.redirect("/dashboards/student");
    }

    const exam = attempt.examId;
    const questions = attempt.answers.map(ans => ans.questionId);

    res.render("result/studentResult", {
      attempt,
      exam,
      questions,
      user: req.session.user,
    });
  } catch (err) {
    console.error("❌ Error showing result:", err);
    req.flash("error", "Failed to load result.");
    res.redirect("/dashboards/student");
  }
};

// View All Results (Admin)
exports.viewExamResults = async (req, res) => {
  try {
    const examId = req.params.examId;
    const exam = await Exam.findById(examId).lean();

    if (!exam) {
      req.flash("error", "Exam not found.");
      return res.redirect("/exam/list");
    }

    const attempts = await Attempt.find({ examId }).populate("studentId").lean();

    res.render("result/examResult", {
      exam,
      attempts,
      user: req.user,
    });
  } catch (err) {
    console.error("❌ Error fetching exam results:", err);
    req.flash("error", "Could not load results.");
    res.redirect("/exam/list");
  }
};

// Toggle Result Visibility (Admin)
exports.toggleExamResultVisibility = async (req, res) => {
  try {
    const examId = req.params.examId;
    const exam = await Exam.findById(examId);

    if (!exam) {
      req.flash("error", "Exam not found.");
      return res.redirect("/exam/list");
    }

    exam.showResults = !exam.showResults;
    await exam.save();

    req.flash("success", `Results are now ${exam.showResults ? "visible" : "hidden"} to students.`);
    res.redirect(`/exam/results/${examId}`);
  } catch (err) {
    console.error("❌ Failed to toggle result visibility:", err);
    req.flash("error", "Something went wrong while toggling result visibility.");
    res.redirect("/exam/list");
  }
};
  
// Admin views a specific student's attempt result
exports.viewStudentResult = async (req, res) => {
  try {
    const attemptId = req.params.attemptId;

    const attempt = await Attempt.findById(attemptId)
      .populate("examId")
      .populate("answers.questionId")
      .populate("studentId");

    if (!attempt) {
      req.flash("error", "Attempt not found.");
      return res.redirect("/exam/list");
    }

    const exam = attempt.examId;
    const questions = attempt.answers.map((a) => a.questionId);

    res.render("result/studentResult", {
      attempt,
      exam,
      questions,
      user: req.user, // admin or superadmin
    });
  } catch (err) {
    console.error("❌ Admin view student result error:", err);
    req.flash("error", "Could not load the student's result.");
    res.redirect("/exam/list");
  }
};
