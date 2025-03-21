import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import User from "../models/user.model.js";
import appResponse from "../utils/appResponse.js";
import { AppError } from "../utils/appError.js";

export const createJobHandler = async (req, res, next) => {
  try {
    const { title, description, company, location, salary, experience, type, requirements } = req.body;

    if (!title || !description || !company || !location || !salary || !experience || !type || !requirements) {
      throw new AppError({ message: "All fields are required", statusCode: 400 });
    }

    const newJob = await Job.create({
      title,
      description,
      company,
      location,
      salary,
      experience,
      type,
      requirements,
      recruiter: req.user.userId,
    });

    appResponse(res, {
      message: "Job created successfully",
      data: newJob
    });
  } catch (error) {
    next(error);
  }
};

export const getJobsHandler = async (req, res, next) => {
  try {
    const { id: jobId, applied } = req.query;
    let query = {};
    let populateOptions = [{ path: 'recruiter', select: 'name email' }];
    if (jobId) {
      query._id = jobId;
    } else if (req.user) {
      if (req.user.role === 'applicant' && applied === 'true') {
        const applications = await Application.find({
          applicant: req.user.userId
        });
        query._id = { $in: applications.map(app => app.job) };
      } else if (req.user.role === 'recruiter') {
        query.recruiter = req.user.userId;
        populateOptions = [{
          path: 'applications',
          select: 'status createdAt',
          populate: {
            path: 'applicant',
            select: 'name email'
          }
        }];
      }
    }

    const jobs = await Job.find(query)
      .populate(populateOptions);

    let appliedJobIds = [];
    if (req.user?.role === 'applicant') {
      const applications = await Application.find({
        applicant: req.user.userId
      });
      appliedJobIds = applications.map(app => app.job.toString());
    }

    const responseData = jobs.map(job => {
      const baseData = {
        _id: job._id,
        title: job.title,
        description: job.description,
        company: job.company,
        location: job.location,
        requirements: job.requirements,
        salary: job.salary,
        type: job.type,
        experience: job.experience
      };

      if (req.user?.role === 'applicant') {
        return {
          ...baseData,
          isApplied: appliedJobIds.includes(job._id.toString())
        };
      }

      if (req.user?.role === 'recruiter' && job.recruiter?.equals(req.user.userId)) {
        return {
          ...baseData,
          applications: job.applications.map(app => ({
            _id: app._id,
            status: app.status,
            applicant: app.applicant
          }))
        };
      }

      return baseData;
    });

    appResponse(res, {
      message: "Jobs fetched successfully",
      data: jobId ? responseData[0] : responseData
    });
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

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.userId
    });

    if (existingApplication) {
      appResponse(res, {
        message: "Already applied to this job",
        statusCode: 400,
        success: false
      });
      return;
    }

    const job = await Job.findById(jobId);
    if (!job) {
      throw new AppError({ message: "Job not found", statusCode: 404 });
    }

    const newApplication = await Application.create({
      job: jobId,
      applicant: req.user.userId,
      recruiter: job.recruiter,
      status: "applied"
    });

    await Promise.all([
      Job.findByIdAndUpdate(jobId, {
        $addToSet: { applications: newApplication._id }
      }),
      User.findByIdAndUpdate(req.user.userId, {
        $push: {
          applications: newApplication._id
        }
      })
    ]);

    appResponse(res, {
      message: "Application submitted successfully",
      statusCode: 201,
    });

  } catch (error) {
    next(error);
  }
};

export const updateJobHandler = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
      return next(new AppError({ message: "At least one field is required to update", statusCode: 400 }));
    }

    const updateJob = await Job.findByIdAndUpdate(jobId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updateJob) {
      return next(new AppError({ message: "Job not found", statusCode: 404 }));
    }

    appResponse(res, {
      message: "Job updated successfully",
      data: updateJob,
      statusCode: 200,
    });

  } catch (error) {
    next(error);
  }
};


export const deleteJobHandler = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const deletedJob = await Job.findByIdAndDelete(jobId);
    if (!deletedJob) {
      return next(new AppError({ message: "Job not found ", statusCode: 404 }));
    }

    appResponse(res, {
      message: "Job deleted successfully",
      statusCode: 200
    });

  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatusHandler = async (req, res, next) => {
  try {
    const { applicationId, status } = req.body;
    const application = await Application.findById(applicationId)
      .populate('job', 'recruiter');

    if (!application) {
      throw new AppError({ message: "Application not found", statusCode: 404 });
    }

    if (application.job.recruiter.toString() !== req.user.userId) {
      throw new AppError({ message: "Not authorized", statusCode: 403 });
    }

    const updatedApp = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    ).populate('applicant', 'name email');

    appResponse(res, {
      message: `Application ${status} successfully`,
      data: updatedApp
    });

  } catch (error) {
    next(error);
  }
};


export const getApplicationsHandler = async (req, res, next) => {
  try {
    const { jobId, status } = req.query;
    let query = { recruiter: req.user.userId };

    if (jobId) {
      query.job = jobId;
    }

    if (status && ['applied', 'reviewed', 'shortlisted', 'rejected'].includes(status)) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('job', 'title company location')
      .populate('applicant', 'name email')
      .sort({ createdAt: -1 });

    appResponse(res, {
      message: "Applications fetched successfully",
      data: applications
    });
  } catch (error) {
    next(error);
  }
};
