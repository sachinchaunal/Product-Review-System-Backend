import Admin from "../models/admin.model.js";
import userService from "../services/user.service.js";
import productService from "../services/product.service.js";
import adminService from "../services/admin.service.js";
import dotenv from "dotenv";

dotenv.config();

const RegisterAdmin = async (req, res) => {
  try {
    const { username, password, role, superPassword } = req.body;

    // Check if super password is correct
    const adminSuperPassword = process.env.ADMIN_SUPER_PASSWORD;
    if (!adminSuperPassword || superPassword !== adminSuperPassword) {
      return res.status(401).json({ error: "Invalid super password" });
    }

    // Create admin using the admin service
    const admin = await adminService.createAdmin({
      username,
      password,
      role: role || "moderator",
    });

    const token = await admin.generateAuthToken();

    // Remove password from response
    admin.password = undefined;

    res.cookie("adminToken", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 3600000),
    });
    
    res.status(201).json({ admin, adminToken: token });
  } catch (error) {
    if (error.message === "Username already exists") {
      return res.status(409).json({ error: "Username already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

const LoginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findByCredentials(username, password);

    const token = await admin.generateAuthToken();

    res.cookie("adminToken", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 3600000),
    });
    res.send({ admin, adminToken: token });
  } catch (e) {
    res.status(400).send({ error: "Invalid Credentials" });
  }
};

const LogoutAdmin = async (req, res) => {
  try {
    const token =
      req.cookies?.adminToken || req.headers.authorization?.split(" ")[1];
    res.clearCookie("adminToken");
    await userService.blackListToken(token);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getDashBoardData = async (req, res) => {
  try {
    const totalUsers = await userService.getUserCount();
    const totalModerators = await adminService.getModeratorCount();
    const reviewsByStatus = await productService.getReviewCountByStatus();
    const productStatus = await productService.getProductStatus(req.admin._id);
    res.status(200).json({
      totalUsers,
      totalModerators,
      reviewsByStatus,
      productStatus,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const reviews = await productService.getReviews();
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  const users = await userService.getAllUsers();

  res.status(200).json(users);
};

const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProductsByAdmin(req.admin._id);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteProductById = async (req, res) => {
  const productId = req.params.id;
  try {
    await productService.deleteProductById(productId);
    res.status(200).json({ message: "Product deleted successfully}" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateProductById = async (req, res) => {
  const productId = req.params.id;
  const data = req.body;
  try {
    await productService.updateProductById(productId, data);
    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const deletReviewById = async (req, res) => {
  const reviewId = req.params.id;
  try {
    await productService.deleteProductReviewById(reviewId);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
};

export default {
  RegisterAdmin,
  LoginAdmin,
  LogoutAdmin,
  getDashBoardData,
  getReviews,
  getAllUsers,
  getAllProducts,
  deleteProductById,
  updateProductById,
  deletReviewById,
};
