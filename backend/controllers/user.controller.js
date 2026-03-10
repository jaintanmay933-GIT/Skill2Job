import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

/* =========================
   REGISTER USER
========================= */
export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        let profilePhotoUrl = ""; // Start with an empty string

        // NEW LOGIC: Check if a file was uploaded during signup!
        if (req.file) {
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhotoUrl = cloudResponse.secure_url;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            // Save the profile photo URL inside the profile object!
            profile: {
                profilePhoto: profilePhotoUrl || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" // Fallback to default if no file uploaded
            }
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
        });

    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during registration",
        });
    }
};

/* =========================
   LOGIN USER
========================= */
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Something is missing",
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (user.role !== role) {
            return res.status(400).json({
                success: false,
                message: "Role mismatch. Please login with correct role."
            });
        }

        // 4. Generate JWT
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 5. Send cookie with optimized local settings
        return res
            .status(200)
            .cookie("token", token, {
                httpOnly: true,
                secure: false,      // Set to false for HTTP localhost
                sameSite: "lax",    // Better compatibility for cross-port localhost
                maxAge: 1 * 24 * 60 * 60 * 1000,
                path: "/",          // Ensures cookie is available for all API paths
            })
            .json({
                success: true,
                message: `Welcome back ${user.fullname}`,
                user: {
                    _id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    role: user.role,
                    profile: user.profile // 👈 THIS IS THE FIX! Now Redux gets the picture URL!
                },
            });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during login",
        });
    }
};

/* =========================
   LOGOUT USER
========================= */
export const logout = async (req, res) => {
    try {
        return res
            .status(200)
            .cookie("token", "", { 
                maxAge: 0,
                path: "/" // Match the path used in login to clear properly
            })
            .json({
                success: true,
                message: "Logout successful",
            });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Logout failed",
        });
    }
};

/* =========================
   GET USER PROFILE
========================= */
export const getProfile = async (req, res) => {
    try {
        const userId = req.userId; // Matches req.userId assignment in isAuth.js

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
        });
    }
};

/* =========================
   UPDATE PROFILE
========================= */
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const userId = req.userId; 

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // --- FIXED CLOUDINARY LOGIC ---
        if (req.file) {
            const fileUri = getDataUri(req.file);
            
            // Check the file type FIRST
            if (req.file.mimetype.startsWith("image/")) {
                // It's an image! Save it as the profile photo
                const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
                user.profile.profilePhoto = cloudResponse.secure_url;
            } else {
                // It's a document! We MUST add { resource_type: "raw" }
                const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                    resource_type: "raw"
                });
                user.profile.resume = cloudResponse.secure_url;
                user.profile.resumeOriginalName = req.file.originalname;
            }
        }
        // ------------------------------

        if (skills) {
            user.profile.skills = skills.split(",").map(s => s.trim());
        }

        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;

        await user.save();

        user.password = undefined;

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });

    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating profile",
        });
    }
};