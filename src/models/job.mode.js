import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: Number, required: true },
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] 
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", JobSchema);
export default Job;
