import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
  },
  status: {
    type: String,
    enum: ["applied", "reviewed", "shortlisted", "rejected"],
    default: "applied"
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { 
  timestamps: true 
});

const Application = mongoose.model("Application", ApplicationSchema);
export default Application;