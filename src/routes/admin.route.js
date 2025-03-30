import express from "express";
import adminController from "../controllers/admin.controller.js";
import adminAuth from "../middlewares/adminAuth.middleware.js";
import Admin from "../models/admin.model.js";
import User from "../models/user.model.js";
const router = express.Router();

router.post("/register", adminController.RegisterAdmin);
router.post("/login", adminController.LoginAdmin);
router.get("/logout", adminAuth, adminController.LogoutAdmin);
router.get("/users", adminAuth, adminController.getAllUsers);
router.get("/dashboard", adminAuth, adminController.getDashBoardData);
router.get("/reviews", adminAuth, adminController.getReviews);
router.get("/products", adminAuth, adminController.getAllProducts);
router.delete("/products/:id", adminAuth, adminController.deleteProductById);
router.patch("/products/:id", adminAuth, adminController.updateProductById);
router.delete("/reviews/:id", adminAuth, adminController.deletReviewById);
export default router;
