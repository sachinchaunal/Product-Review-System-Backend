import productService from "../services/product.service.js";
import scrapeService from "../services/scrape.service.js";
const scrapeFlipkart = async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }
  try {
    const { name, price, images } = await scrapeService.ScrapeFlipkart(url);
    res.status(200).json({ name, price, images });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const scrapeAmazon = async (req, res) => {};

const addProduct = async (req, res) => {
  try {
    const product = productService.createProduct({
      productDetail: req.body,
      adminDetail: req.admin,
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await productService.getProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const reviews = await productService.getProductReviews(req.params.id);
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const addProductReview = async (req, res) => {
  try {
    const product = await productService.addProductReview({
      userId: req.user._id,
      productId: req.params.id,
      review: req.body,
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};
const updateReviewStatus = async (req, res) => {
  console.log(req.params.reviewId, req.body.status, req.params.reviewId);
  try {
    const review = await productService.updateReviewStatus({
      reviewId: req.params.reviewId,
      status: req.body.status,
      adminId: req.admin._id,
    });
    res.status(200).json(review);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  scrapeFlipkart,
  scrapeAmazon,
  addProduct,
  getProducts,
  getProductById,
  getProductReviews,
  addProductReview,
  updateReviewStatus,
};
