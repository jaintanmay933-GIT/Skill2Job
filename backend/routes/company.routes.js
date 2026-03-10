import express from "express";
import {
  getCompany,
  registerCompany,
  getCompanyById,
  updateCompany,
} from "../controllers/company.controller.js";
import { isAuth } from "../middleware/isauth.js";
import { singleUpload } from "../middleware/mutler.js";

const router = express.Router();

// Register company
router.route("/register").post(isAuth, registerCompany);

// Get logged-in user's companies
router.route("/getcompany").get(isAuth, getCompany);

// Get single company
router.route("/getcompany/:id").get(isAuth, getCompanyById);

// Update company
router.route("/update/:id").put(isAuth, singleUpload ,updateCompany);

export default router;
