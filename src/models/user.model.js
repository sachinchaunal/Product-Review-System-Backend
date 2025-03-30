import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/config.js";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      firstName: {
        type: String,
        required: [true, "First name is required"],
        minlength: [2, "First name must be at least 2 characters long"],
      },
      lastName: {
        type: String,
        default: "",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    username: {
      type: String,
      unique: true,
      required: [true, "Username is required"],
      minlength: [3, "Username must be at least 3 characters long"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    creditPoints: { type: Number, default: 0 },
    profileImage: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: true },
    userLevel: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Hash password method
userSchema.statics.hashPassword = async function (password) {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (err) {
    throw new Error("Password hashing failed");
  }
};

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    throw new Error("Password comparison failed");
  }
};

// Generate JWT token method
userSchema.methods.generateToken = function () {
  try {
    const payload = { id: this._id };
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiration,
    });
  } catch (err) {
    throw new Error("Token generation failed");
  }
};

// Check if email exists method
userSchema.statics.isEmailExist = async function (email) {
  try {
    const user = await this.findOne({ email });
    return !!user;
  } catch (err) {
    throw new Error("Error checking email existence");
  }
};

const User = mongoose.model("User", userSchema);

export default User;
