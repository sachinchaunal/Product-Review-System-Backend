import express from "express";
import { body } from "express-validator";
import userController from "../controllers/user.controller.js";
import authUser from "../middlewares/auth.middleware.js";

const router = express.Router();

// route for user registration
router.post(
  "/register",
  [
    body("fullName.firstName")
      .isLength({ min: 2 })
      .withMessage("First name must be at least 2 characters long"),
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  userController.registrUser
);

router.post("/login", userController.loginUser);

// route for user profile
router.get("/profile", authUser, userController.getProfile);

router.post("/reset-password", userController.resetPassword);

router.post("/verify-otp/password", userController.verifyOtpForPasswordReset);

router.patch(
  "/change-password",
  [
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  userController.changePassword
);

// route for user logout
router.get("/logout", authUser, userController.logoutUser);

router.patch("/profile", authUser, userController.updateProfile);
export default router;
