import express from "express";
import { createJobHandler, getJobsHandler, applyJobHandler } from "../handlers/job.handler.js";
import { protect, authorizeRoles } from '../middlewares/auth.mid.js';

const router = express.Router();

router.post("/jobs", 
    protect,
    authorizeRoles('recruiter'), 
    createJobHandler
);

router.get("/jobs", getJobsHandler);
router.post(
    "/apply",
    protect,
    authorizeRoles('applicant'),
    applyJobHandler
);

export default router;
