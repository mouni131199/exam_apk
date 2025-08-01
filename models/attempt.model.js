const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  selectedOption: {
    type: [Number],
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
});

const attemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    answers: [answerSchema],
    score: Number,
    showResult: {
      type: Boolean,
      default: false,
    },
    showQuestions: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attempt", attemptSchema);
