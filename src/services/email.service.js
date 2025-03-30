import nodemailer from "nodemailer";
import generateOtp from "../utils/generateOtp.js";
import OTPModel from "../models/otp.model.js";
import UserModel from "../models/user.model.js";
import { emailConfig } from "../config/config.js";

const sendOtp = async (email, subject) => {
  const user = await UserModel.findOne({ email });

  if (!user) {
    return false;
  }

  const otp = generateOtp(6);

  await OTPModel.create({
    userId: user._id,
    otp,
  });
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use your email service (e.g., Gmail, Outlook, Yahoo)
    auth: {
      user: emailConfig.user, // Your email address
      pass: emailConfig.pass, // Your email password (or App Password for Gmail)
    },
  });

  const mailOptions = {
    from: emailConfig.user, // Sender's email
    to: email, // Recipient's email
    subject: `${subject} OTP`, // Email subject
    html: `<p>Your OTP for ${subject} is: <strong>${otp}</strong></p>`, // Email content
  };

  try {
    await transporter.sendMail(mailOptions);
    transporter.close();
    return true;
  } catch (err) {
    transporter.close();
    return false;
  }
};

const verifyOtp = async (email, otp) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    return false;
  }
  const otpRecord = await OTPModel.findOne({ userId: user._id, otp });
  if (!otpRecord) {
    return false;
  }
  return true;
};

export default { sendOtp, verifyOtp };
