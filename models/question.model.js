const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  questionText: {
    type: String,
    required: true
    // Removed unique: true to allow same questionText again
  },
  options: [String],
  correctAnswers: [Number],
  allowMultiple: {
    type: Boolean,
    default: false,
  },
  explanation: String,
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
