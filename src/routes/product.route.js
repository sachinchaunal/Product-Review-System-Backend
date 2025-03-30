import express from "express";
import productController from "../controllers/product.controller.js";
import adminAuth from "../middlewares/adminAuth.middleware.js";
import authUser from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/scrape/flipkart", adminAuth, productController.scrapeFlipkart);
router.get("/scrape/amazon/:url", adminAuth, productController.scrapeAmazon);
router.post("/", adminAuth, productController.addProduct);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.get("/:id/reviews", productController.getProductReviews);
router.post("/:id/reviews", authUser, productController.addProductReview);
router.patch(
  "/:id/reviews/:reviewId",
  adminAuth,
  productController.updateReviewStatus
);

export default router;
