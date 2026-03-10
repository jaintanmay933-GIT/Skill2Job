import Company from "../models/company.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

/* =========================
   REGISTER COMPANY
========================= */
export const registerCompany = async (req, res) => {
    try {
        const { companyName } = req.body;
        const userId = req.userId; 

        if (!companyName) {
            return res.status(400).json({ success: false, message: "Company name is required" });
        }

        const existingCompany = await Company.findOne({ name: companyName });
        if (existingCompany) {
            return res.status(400).json({ success: false, message: "Company already exists" });
        }

        const company = await Company.create({
            name: companyName,
            userId, 
        });

        return res.status(201).json({
            success: true,
            message: "Company registered successfully",
            company,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/* =========================
   GET LOGGED-IN USER COMPANIES
========================= */
export const getCompany = async (req, res) => {
    try {
        const userId = req.userId;
        const companies = await Company.find({ userId });
        return res.status(200).json({
            success: true,
            companies: companies || [],
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/* =========================
   GET COMPANY BY ID (Fixed Missing Export)
========================= */
export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }
        return res.status(200).json({ success: true, company });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/* =========================
   UPDATE COMPANY
========================= */
export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const updateData = { name, description, website, location };

        if (req.file) {
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            updateData.logo = cloudResponse.secure_url;
        }

        const company = await Company.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId }, 
            updateData,
            { returnDocument: 'after' } 
        );

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found or unauthorized" });
        }

        return res.status(200).json({ success: true, message: "Company updated successfully", company });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/* =========================
   DELETE COMPANY
========================= */
export const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.userId 
        });

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found or unauthorized" });
        }

        return res.status(200).json({ success: true, message: "Company deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};