import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  experience: { type: String, required: true },
  type: { type: String, enum: ["Full-time", "Part-time", "Contract", "Internship"], required: true },
  status: { type: String, enum: ["pending", "approved"], default: "pending" },
  requirements: { type: [String], required: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application"
  }]
}, { timestamps: true });

const Job = mongoose.model("Job", JobSchema);
export default Job;
