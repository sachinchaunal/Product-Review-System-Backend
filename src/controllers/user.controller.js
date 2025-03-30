import { validationResult } from "express-validator";
import userService from "../services/user.service.js";

const registrUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { fullName, username, email, password } = req.body;

    const { user } = await userService.createUser({
      firstName: fullName.firstName,
      lastName: fullName.lastName,
      username,
      email,
      password,
    });
    res.status(201).json({ user });
  } catch (err) {
    if (err.message === "Email already exists") {
      return res.status(409).json({ error: "Email already exists" });
    }
    if (err.message === "Username already exists") {
      return res.status(409).json({ error: "Username already exists" });
    }
    return res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email && !username) {
      return res.status(400).json({ error: "Email or username is required" });
    }

    const { user, token } = await userService.findUser({
      username,
      email,
      password,
    });

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 3600000),
    });
    res.status(200).json({ user, token });
  } catch (err) {
    if (err.message === "Invalid Credentials") {
      return res.status(400).json({ error: "Invalid Credentials" });
    }
    return res.status(500).json({ error: err.message });
  }
};

const getProfile = async (req, res) => {
  res.status(200).json({ user: req.user });
};

const logoutUser = async (req, res) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];
    res.clearCookie("token");
    await userService.blackListToken(token);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    await userService.resetPassword(email);
    res.status(200).json({ message: "Password reset link sent successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const verifyOtpForPasswordReset = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const token = await userService.verifyOtpForPasswordReset(email, otp);
    res.status(200).json({ message: "OTP verfied succefully", token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { newPassword, token } = req.body;
    if (!newPassword) {
      return res.status(400).json({ errors: ["All fields are required"] });
    }
    await userService.changePassword(token, newPassword);
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await userService.updateProfile(userId, req.body);

    res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default {
  registrUser,
  loginUser,
  getProfile,
  logoutUser,
  resetPassword,
  verifyOtpForPasswordReset,
  changePassword,
  updateProfile,
};
