import express from "express";
import { 
  createJobHandler, 
  getJobsHandler, 
  applyJobHandler, 
  updateApplicationStatusHandler, 
  getJobApplicationsHandler,  
  deleteJobHandler, 
  updateJobHandler,
  getApplicantApplicationsHandler
} from "../handlers/job.handler.js";


import { protect, authorizeRoles } from '../middlewares/auth.mid.js';
import getIdAndRole from "../middlewares/getIdAndRole.mid.js";

const router = express.Router();

router.post("/jobs",
    protect,
    authorizeRoles('recruiter'),
    createJobHandler
);

router.get("/jobs", getIdAndRole, getJobsHandler);

router.post(
    "/jobs/apply",
    protect,
    authorizeRoles('applicant'),
    applyJobHandler
);


router.delete(
    "/jobs/:jobId",
    protect,
    authorizeRoles('recruiter'),
    deleteJobHandler
)

router.patch(
    "/jobs/:jobId",
    protect,
    authorizeRoles('recruiter'),
    updateJobHandler
)


router.get(
    "/applicant/applications",
    protect,
    authorizeRoles('applicant'),
    getApplicantApplicationsHandler
);

router.patch(
    "/applications/status",
    protect,
    authorizeRoles('recruiter'),
    updateApplicationStatusHandler
);

router.get(
    "/jobs/:jobId/applications",
    protect,
    authorizeRoles('recruiter'),
    getJobApplicationsHandler
);

export default router;
