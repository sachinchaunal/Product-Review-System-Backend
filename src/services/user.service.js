import UserModel from "../models/user.model.js";
import BlackListTokenModel from "../models/blackListToken.model.js";
import emailService from "./email.service.js";
import { jwtConfig } from "../config/config.js";
import jwt from "jsonwebtoken";
const createUser = async ({
  firstName,
  lastName,
  username,
  email,
  password,
}) => {
  if (!firstName || !username || !email || !password) {
    throw new Error("All fields are required");
  }
  const existingUser = await UserModel.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error("Email already exists");
    }
    if (existingUser.username === username) {
      throw new Error("Username already exists");
    }
  }

  try {
    const hashedPassword = await UserModel.hashPassword(password);
    const user = await UserModel.create({
      fullName: { firstName, lastName },
      username,
      email,
      password: hashedPassword,
    });
    user.password = undefined;
    const token = user.generateToken();
    return { user, token };
  } catch (err) {
    throw err;
  }
};

const findUser = async ({ email, username, password }) => {
  let user;
  if (email === undefined) {
    user = await UserModel.findOne({ username }).select("+password");
  } else {
    user = await UserModel.findOne({ email }).select("+password");
  }

  if (!user) {
    throw new Error("Invalid Credentials");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new Error("Invalid Credentials");
  }
  user.password = undefined;
  const token = user.generateToken();

  return { user, token };
};

const blackListToken = async (token) => {
  try {
    await BlackListTokenModel.create({ token });
  } catch (err) {
    throw err;
  }
};

const resetPassword = async (email) => {
  const otpSend = await emailService.sendOtp(email, "Password Reset");
  if (!otpSend) {
    throw new Error("Failed to send OTP");
  }
};

const verifyOtpForPasswordReset = async (email, otp) => {
  const isVerified = await emailService.verifyOtp(email, otp);
  if (!isVerified) {
    throw new Error("Invalid OTP");
  }
  return jwt.sign({ email }, jwtConfig.secret, { expiresIn: "5m" });
};

const changePassword = async (token, password) => {
  if (!password) {
    throw new Error("All fields are required");
  }

  try {
    const decode = jwt.verify(token, jwtConfig.secret);

    const email = decode.email;

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      throw new Error("User not found");
    }

    const hashedPassword = await UserModel.hashPassword(password);

    user.password = hashedPassword;

    await user.save();
    blackListToken(token);
    user.password = undefined;
  } catch (err) {
    throw err;
  }
};

const getUserCount = async () => {
  return await UserModel.countDocuments();
};

const getAllUsers = async () => {
  return await UserModel.find().lean();
};

const updateProfile = async (userId, data) => {
  try {
    const user = await UserModel.findByIdAndUpdate(userId, data, {
      new: true,
    }).lean();
    return user;
  } catch (error) {
    throw error;
  }
};

export default {
  createUser,
  findUser,
  blackListToken,
  resetPassword,
  verifyOtpForPasswordReset,
  changePassword,
  getUserCount,
  getAllUsers,
  updateProfile,
};
