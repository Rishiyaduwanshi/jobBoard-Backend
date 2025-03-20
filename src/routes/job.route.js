import express from "express";
import { createJobHandler, getJobsHandler, applyJobHandler } from "../handlers/job.handler.js";

const router = express.Router();

router.post("/create", createJobHandler);
router.get("/list", getJobsHandler);
router.post("/apply", applyJobHandler);

export default router;
