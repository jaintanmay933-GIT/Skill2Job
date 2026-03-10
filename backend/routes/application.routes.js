import express from "express";
import { isAuth } from "../middleware/isauth.js";
import {
  applyJob,
  getApplicants,
  getAppliedJobs,
  updateStatus,
} from "../controllers/application.controller.js";

const router = express.Router();

// Student applies to job
router.route("/apply/:id").post(isAuth, applyJob);

// Student gets his applied jobs
router.route("/get").get(isAuth, getAppliedJobs);

// Recruiter gets applicants for a job
router.route("/:id/applicants").get(isAuth, getApplicants);

// Recruiter updates application status
router.route("/status/:id/update").post(isAuth, updateStatus);

export default router;
