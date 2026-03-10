import Application from "../models/application.js";
import Job from "../models/job.js";

/* =========================
   APPLY FOR A JOB (Student)
========================= */
export const applyJob = async (req, res) => {
    try {
        const userId = req.userId; // Matches req.userId in isAuth.js
        const jobId = req.params.id;

        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: "Job ID is required.",
            });
        }

        // 1. Check if user already applied
        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: userId,
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: "You have already applied for this job",
            });
        }

        // 2. Check if the job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        // 3. Create the new application
        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
        });

        // 4. Update the Job model's applications array
        job.applications.push(newApplication._id);
        await job.save();

        return res.status(201).json({
            success: true,
            message: "Job applied successfully.",
        });
    } catch (error) {
        console.error("Apply Job Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while applying",
        });
    }
};

/* =========================
   GET APPLIED JOBS (Student Dashboard)
========================= */
export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.userId;

        const applications = await Application.find({ applicant: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: "job",
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: "company",
                    options: { sort: { createdAt: -1 } },
                }
            });

        if (!applications || applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No applications found.",
            });
        }

        return res.status(200).json({
            success: true,
            applications,
        });
    } catch (error) {
        console.error("Get Applied Jobs Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching applications",
        });
    }
};

/* =========================
   GET APPLICANTS (Admin - Per Job)
========================= */
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;

        // Fetch the job and populate the application list along with applicant details
        const job = await Job.findById(jobId).populate({
            path: "applications",
            options: { sort: { createdAt: -1 } },
            populate: {
                path: "applicant"
            }
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found.",
            });
        }

        return res.status(200).json({
            success: true,
            job,
        });
    } catch (error) {
        console.error("Get Applicants Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching applicants",
        });
    }
};

/* =========================
   UPDATE STATUS (Admin)
========================= */
export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required",
            });
        }

        // Find application by ID
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found.",
            });
        }

        // Update status
        application.status = status.toLowerCase();
        await application.save();

        return res.status(200).json({
            success: true,
            message: "Status updated successfully.",
        });
    } catch (error) {
        console.error("Update Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating status",
        });
    }
};