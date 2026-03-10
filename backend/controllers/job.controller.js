import Job from "../models/job.js";

/* =========================
   POST JOB (Admin Only)
========================= */
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId,
    } = req.body;

    // 🔥 SYNCED: Matches req.userId from isAuth.js middleware
    const userId = req.userId;

    if (
      !title || !description || !requirements || !salary ||
      !location || !jobType || !experience || !position || !companyId
    ) {
      return res.status(400).json({ 
        message: "Something is missing.", 
        success: false 
      });
    }

    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(",").map(req => req.trim()), // Clean up spaces
      salary: Number(salary),
      location,
      jobType,
      experienceLevel: experience,
      position,
      company: companyId,
      createdBy: userId, 
    });

    return res.status(201).json({ 
      message: "New job created successfully.", 
      job, 
      success: true 
    });
  } catch (error) {
    console.error("Post Job Error:", error);
    return res.status(500).json({ 
      message: "Server Error", 
      success: false 
    });
  }
};

/* =========================
   GET ALL JOBS (Public/Student)
========================= */
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    // Search by title or description
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };

    const jobs = await Job.find(query)
      .populate({
        path: "company"
      })
      .sort({ createdAt: -1 });

    if (!jobs) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false
      });
    }

    return res.status(200).json({ 
      jobs, 
      success: true 
    });
  } catch (error) {
    console.error("Get All Jobs Error:", error);
    return res.status(500).json({ 
      message: "Server Error", 
      success: false 
    });
  }
};

/* =========================
   GET JOB BY ID
========================= */
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId)
      .populate({
        path: "company"
      })
      .populate({
        path: "applications"
      });

    if (!job) {
      return res.status(404).json({ 
        message: "Job not found.", 
        success: false 
      });
    }

    return res.status(200).json({ 
      job, 
      success: true 
    });
  } catch (error) {
    console.error("Get Job By Id Error:", error);
    return res.status(500).json({ 
      message: "Server Error", 
      success: false 
    });
  }
};

/* =========================
   GET ADMIN JOBS (Admin Dashboard)
========================= */
export const getAdminJobs = async (req, res) => {
  try {
    // 🔥 SYNCED: Fetching only jobs created by the logged-in admin
    const adminId = req.userId;
    
    const jobs = await Job.find({ createdBy: adminId })
      .populate({
        path: "company"
      })
      .sort({ createdAt: -1 });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        message: "No jobs found for this admin.",
        success: false
      });
    }

    return res.status(200).json({ 
      jobs, 
      success: true 
    });
  } catch (error) {
    console.error("Get Admin Jobs Error:", error);
    return res.status(500).json({ 
      message: "Server Error", 
      success: false 
    });
  }
};