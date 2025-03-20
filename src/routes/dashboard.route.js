import express from "express";
import { dashboardHandler } from "../handlers/dashboard.handler.js";

const router = express.Router();

router.get("/", dashboardHandler);

export default router;
