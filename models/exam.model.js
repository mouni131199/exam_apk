// ✅ Updated: exam.model.js (Add duration)
const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  numberOfQuestions: {
    type: Number,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
  }],
  isActive: {
    type: Boolean,
    default: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  showResults: {
    type: Boolean,
    default: false,
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 15,
  }
}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);
