const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, unique: true, required: true },
  password: { type: String, required: true },
  rollNo:   { type: String, required: true },
  year:     { type: String, required: true },
  verified: { type: Boolean, default: false },

  // Store the IDs of exams student attempted
  attemptedExams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }]
});

module.exports = mongoose.model("Student", studentSchema);
