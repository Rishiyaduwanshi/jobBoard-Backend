import Job from "../models/job.model.js";
import appResponse from "../utils/appResponse.js";
import { AppError } from "../utils/AppError.js";

export const createJobHandler = async (req, res, next) => {
  try {
    const { title, description, salary, location } = req.body;
    if (!title || !description || !salary || !location) {
      throw new AppError({ message: "All fields are required", statusCode: 400 });
    }

    const newJob = await Job.create({ title, description, salary, location, createdBy: req.user.userId });
    appResponse(res, { message: "Job created successfully", data: newJob });
  } catch (error) {
    next(error);
  }
};

export const getJobsHandler = async (req, res, next) => {
  try {
    const jobs = await Job.find();
    appResponse(res, { message: "Jobs fetched successfully", data: jobs });
  } catch (error) {
    next(error);
  }
};

export const applyJobHandler = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      throw new AppError({ message: "Job ID is required", statusCode: 400 });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      throw new AppError({ message: "Job not found", statusCode: 404 });
    }

    job.applicants.push(req.user.userId);
    await job.save();

    appResponse(res, { message: "Job application submitted successfully" });
  } catch (error) {
    next(error);
  }
};
