import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import User from "../models/user.model.js";
import appResponse from "../utils/appResponse.js";
import { AppError } from "../utils/appError.js";
import mongoose from 'mongoose';

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
    const { id: jobId, applied, location, type, salary, experience } = req.query;
    let query = {};
    let populateOptions = [{ path: 'recruiter', select: 'name email' }];

    if (jobId) {
      query._id = jobId;
    } else {
      if (location) {
        query.location = { $regex: location, $options: 'i' };
      }

      if (type) {
        const typeMap = {
          'full-time': 'Full-time',
          'part-time': 'Part-time',
          'contract': 'Contract',
          'internship': 'Internship'
        };
        query.type = typeMap[type] || type;
      }

      if (salary) { 
        if (salary === '0-50000') {
          // Handle only ₹ format
          query.salary = { $regex: /₹0|₹[1-4]\d{1,4}|₹50,000/, $options: 'i' };
        } else if (salary === '50000-100000') {
          query.salary = { $regex: /₹5\d{1,4}|₹[6-9]\d{1,4}|₹100,000/, $options: 'i' };
        } else if (salary === '100000+') {
          query.salary = { $regex: /₹1\d{5,}|₹[2-9]\d{5,}/, $options: 'i' };
        } else {
          query.salary = { $regex: salary, $options: 'i' };
        }
      }

      if (experience) {
        const expMap = {
          'entry': 'Entry Level|0-2 years|Junior|1\\+ years|2\\+ years',
          'mid': 'Mid Level|2-5 years|3-5 years|3\\+ years|4\\+ years|5\\+ years',
          'senior': 'Senior Level|5\\+ years|6\\+ years|7\\+ years|8\\+ years|10\\+ years'
        };

        if (expMap[experience]) {
          query.experience = { $regex: expMap[experience], $options: 'i' };
        } else {
          query.experience = { $regex: experience, $options: 'i' };
        }
      }

      if (req.user) {
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


export const getJobApplicationsHandler = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findById(jobId);
    if (!job) {
      throw new AppError({ message: "Job not found", statusCode: 404 });
    }

    if (!job.recruiter.equals(req.user.userId)) {
      throw new AppError({ message: "Unauthorized access", statusCode: 403 });
    }

    const applications = await Application.find({ job: new mongoose.Types.ObjectId(jobId) })
      .populate({
        path: 'applicant',
        select: 'name email phone skills education workExperience resume -_id',
        transform: doc => ({
          name: doc?.name,
          contact: doc?.email,
          phone: doc?.phone,
          skills: doc?.skills,
          education: doc?.education,
          experience: doc?.workExperience,
          resume: doc?.resume
        })
      });

    if (applications.length === 0) {
      return appResponse(res, {
        message: "No applications found for this job",
        data: []
      });
    }

    appResponse(res, {
      message: "Applications fetched successfully",
      data: applications.map(app => ({
        applicationId: app._id,
        status: app.status,
        appliedDate: app.createdAt,
        applicantProfile: app.applicant,
        jobDetails: {
          title: job.title,
          company: job.company,
          location: job.location
        }
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicantApplicationsHandler = async (req, res, next) => {
  try {
    const { userId} = req.user;
    const applicantApplications = await Application.find({applicant: userId})
    .populate('job', "title company location salary type")
    .select('status createdAt')
    .lean()
    appResponse(res, {
      message: "Applications fetched successfully",
      data: applicantApplications
    });
    
  } catch (error) {
  next(error);  
  }
};




const job =         {
  "_id": "67de02eca96cd78551531e3e",
  "job": {
      "_id": "67de01efbe326481839ad414",
      "title": "UI/UX Designer",
      "description": "We need a creative UI/UX Designer to design engaging user experiences. You will work closely with developers and product teams to enhance the usability and aesthetics of our applications.",
      "company": "Design Lab",
      "location": "Gurgaon, IN", 
      "salary": "₹70,000 - ₹1,20,000",
      "experience": "2+ years",
      "type": "Full-time",
      "requirements": [
          "2+ years of experience in UI/UX design",
          "Proficiency in Figma, Adobe XD, and Sketch",
          "Strong knowledge of user psychology and behavior",
          "Experience with responsive and adaptive design",
          "Ability to create wireframes and prototypes"
      ],
      "recruiter": "67dbd5767ba6287dd2f2b494",
      "applications": [
          "67de02eca96cd78551531e3e"
      ],
      "createdAt": "2025-03-22T00:18:55.367Z",
      "updatedAt": "2025-03-22T00:23:08.154Z",
      "__v": 0
  },
  "applicant": "67dbe6992ef69cb34f9693cf",
  "status": "shortlisted",
  "recruiter": {
      "applications": [],
      "_id": "67dbd5767ba6287dd2f2b494",
      "name": "Abhinav Prakash",
      "email": "abp@mail.com",
      "password": "$2b$10$PNNUddWRduiYhiqby4fPF.l5.XZX3Al4QsyVYik0V9xSPGXsRLy2y",
      "role": "recruiter",
      "createdAt": "2025-03-20T08:44:38.809Z",
      "updatedAt": "2025-03-25T23:41:59.230Z",
      "__v": 0,
      "bio": "A full-stack developer with a passion for building dynamic and efficient web applications. Skilled in JavaScript, Node.js, Express.js, and MongoDB, I focus on creating scalable backend solutions. I’m also experienced in Linux environments and AWS cloud services, which help me deploy and manage applications with ease. With a background in WordPress development and intermediate knowledge of Java, I’m always looking to expand my skill set. Driven by a love for innovation, my goal is to solve real-world problems with creative and reliable tech solutions.\n\nIn addition to my expertise in full-stack development, I also have experience with MS Word and Excel, which I utilize for documentation, data analysis, and reporting, ensuring organized and efficient workflows in my projects. ",
      "companyDescription": "We aim to provide website development solution to companies and clients",
      "companyName": "Job Board",
      "companyWebsite": "https://rishiyaduwanshi.me",
      "education": [],
      "phone": "9876543210",
      "resume": "",
      "skills": [],
      "workExperience": []
  },
  "createdAt": "2025-03-22T00:23:08.131Z",
  "updatedAt": "2025-03-22T12:33:44.447Z",
  "__v": 0
}