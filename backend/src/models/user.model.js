import mongoose from "mongoose";
import { USER_ROLES } from "../constants/roles.js";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    auth0Sub: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.STUDENT,
    },

    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },

    university: String,

    department: String,

    graduationYear: Number,

    isVerified: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    staffVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("User", userSchema);