import express from "express";
import { isAuth } from "../middleware/isauth.js";
import { getAdminJobs, getAllJobs, getJobById, postJob } from "../controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(isAuth, postJob);
router.route("/get").get(isAuth, getAllJobs);
router.route("/get/:id").get(isAuth, getJobById);
router.route("/getadminjobs").get(isAuth, getAdminJobs);

export default router;

