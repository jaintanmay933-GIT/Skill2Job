import express from "express";
import { register, login, updateProfile, logout } from "../controllers/user.controller.js";

import { isAuth } from "../middleware/isauth.js";   // 👈 match filename & export
import { singleUpload } from "../middleware/mutler.js";

const router = express.Router();

router.route("/register").post(singleUpload,register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuth, singleUpload, updateProfile);

export default router;
