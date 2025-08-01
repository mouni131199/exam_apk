const Question = require("../models/question.model");
const Exam = require("../models/exam.model");
const mongoose = require("mongoose");

// ✅ Render add-question form
exports.renderAddForm = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      req.flash("error", "Exam not found.");
      return res.redirect("/exam/list");
    }

    const questions = await Question.find({ exam: exam._id });
    const remaining = exam.numberOfQuestions - questions.length;

    res.render("question/add", {
      exam,
      questions,
      remaining,
    });
  } catch (err) {
    console.error("❌ Render Add Question Error:", err);
    req.flash("error", "Failed to load question form.");
    res.redirect("/exam/list");
  }
};

// ✅ Add question to DB
exports.addQuestion = async (req, res) => {
  try {
    const {
      exam: examId,
      questionText,
      options = [],
      correctAnswers = [],
      explanation,
      allowMultipleAnswers,
    } = req.body;

    const question = new Question({
      exam: new mongoose.Types.ObjectId(examId),
      questionText,
      options,
      correctAnswers: Array.isArray(correctAnswers)
        ? correctAnswers.map(Number)
        : [],
      explanation,
      allowMultiple: allowMultipleAnswers === "on",
    });
    console.log("🛠 Creating question for exam ID:", examId, typeof examId);


    await question.save();

    const exam = await Exam.findById(examId);
    const allQuestions = await Question.find({ exam: examId });

    if (allQuestions.length >= exam.numberOfQuestions) {
      exam.isCompleted = true;
      await exam.save();
      req.flash("success", "All questions added. Exam marked as complete.");
      return res.redirect("/exam/list");
    }

    req.flash("success", "Question added successfully.");
    res.redirect(`/question/add/${examId}`);
  } catch (err) {
    console.error("❌ Add Question Error:", err);
    req.flash("error", `Failed to add question. ${err.message}`);
    res.redirect(`/question/add/${req.params.examId}`);
  }
};
exports.listQuestions = async (req, res) => {
  const examId = req.params.examId;

  try {
    const exam = await Exam.findById(examId).lean();
    if (!exam) {
      req.flash("error", "Exam not found.");
      return res.redirect("/exam/list");
    }

    // ✅ FIX: Use exam._id directly
    const questions = await Question.find({ exam:new mongoose.Types.ObjectId(exam._id) }).lean();

    console.log("✅ Fetched questions:", questions); // Debug line
    console.log("Exam._id type:", typeof exam._id); // should be object


    res.render("question/list", {
      exam,
      examId,
      questions,
      user: req.session.user,
      messages: {
        error: req.flash("error"),
        success: req.flash("success"),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching questions:", error);
    req.flash("error", "Could not load questions.");
    return res.redirect("/exam/list");
  }
};

// ✅ Render edit form
exports.renderEditForm = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId).lean();
    if (!question) {
      req.flash("error", "Question not found.");
      return res.redirect("/exam/list");
    }

    res.render("question/edit", {
      question,
      messages: {
        error: req.flash("error"),
        success: req.flash("success"),
      },
    });
  } catch (err) {
    console.error("❌ Failed to load question for editing:", err);
    req.flash("error", "Failed to load question for editing.");
    res.redirect("/exam/list");
  }
};


// ✅ Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { questionText, options, correctAnswers, explanation, allowMultipleAnswers } = req.body;

    const updated = await Question.findByIdAndUpdate(
      req.params.questionId,
      {
        questionText,
        options,
        correctAnswers: correctAnswers.map(Number),
        explanation,
        allowMultiple: allowMultipleAnswers === "on",
      },
      { new: true }
    );

    req.flash("success", "Question updated.");
    res.redirect(`/question/add/${updated.exam}`);
  } catch (err) {
    console.error("❌ Update Question Error:", err);
    req.flash("error", "Update failed.");
    res.redirect("/exam/list");
  }
};

// ✅ Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) {
      req.flash("error", "Question not found.");
      return res.redirect("/exam/list");
    }

    await Question.findByIdAndDelete(req.params.questionId);
    req.flash("success", "Question deleted.");
    res.redirect(`/question/add/${question.exam}`);
  } catch (err) {
    console.error("❌ Delete Question Error:", err);
    req.flash("error", "Failed to delete question.");
    res.redirect("/exam/list");
  }
};

// ✅ Manually mark exam complete
exports.completeExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    const questions = await Question.find({ exam: exam._id });

    if (questions.length >= exam.numberOfQuestions) {
      exam.isCompleted = true;
      await exam.save();
      req.flash("success", "Exam marked as complete.");
    } else {
      req.flash("error", "Not enough questions to complete the exam.");
    }

    res.redirect("/exam/list");
  } catch (err) {
    console.error("❌ Complete Exam Error:", err);
    req.flash("error", "Failed to complete exam.");
    res.redirect("/exam/list");
  }
};
