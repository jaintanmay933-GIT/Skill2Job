import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    location: {
      type: String,
    },

    website: {
      type: String,
      trim: true,
    },

    industry: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    logo: {
      type: String,
      default: "https://www.freeiconspng.com/uploads/company-icon-4.png",
    },

    jobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job", // ⚠️ must match model name exactly
      },
    ],

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);
export default Company;
