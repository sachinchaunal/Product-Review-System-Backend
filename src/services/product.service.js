import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import mongoose from "mongoose";

const createProduct = async ({ productDetail, adminDetail }) => {
  const {
    mainImage,
    images,
    name,
    description,
    price,
    brand,
    category,
    buylink,
  } = productDetail;
  const { _id } = adminDetail;
  try {
    const product = new Product({
      mainImage,
      images,
      name,
      description,
      price,
      brand,
      category,
      buylink,
      adminId: _id,
    });

    await product.save();
    return product;
  } catch (error) {
    throw error;
  }
};

const getProducts = async () => {
  try {
    const products = await Product.find().lean();
    const productsWithRatings = await Promise.all(
      products.map(async (product) => {
        const averageRating = await Review.getAverageRating(product._id);
        return { ...product, averageRating };
      })
    );
    return productsWithRatings;
  } catch (error) {
    throw error;
  }
};

const getProductById = async (id) => {
  try {
    const product = await Product.findById(id).lean();
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error) {
    throw error;
  }
};

const getProductReviews = async (id) => {
  try {
    const reviews = await getReviewsWithUserNames(id);

    return reviews;
  } catch (error) {
    throw error;
  }
};

const getReviewsWithUserNames = async (productId) => {
  const reviews = await Review.aggregate([
    // Match reviews for the specific productId
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },

    // Perform the lookup to join with the users collection
    {
      $lookup: {
        from: "users", // Collection name of users
        localField: "userId", // Field in reviews
        foreignField: "_id", // Field in users
        as: "userDetails", // The resulting array field
      },
    },

    // Unwind the userDetails array (to make it a single object)
    { $unwind: "$userDetails" },

    // Add projection to include only relevant fields and concatenate fullName
    {
      $project: {
        _id: 1,
        userId: 1,
        productId: 1,
        rating: 1,
        comment: 1,
        helpfulVotes: 1,
        reviewStatus: 1,
        reviewImage: 1,
        createdAt: 1,
        updatedAt: 1,
        userName: {
          $concat: [
            "$userDetails.fullName.firstName",
            " ", // Add a space between first and last name
            "$userDetails.fullName.lastName",
          ],
        },
      },
    },
  ]);

  return reviews;
};

const addProductReview = async ({ userId, productId, review }) => {
  const { rating, comment, reviewImage } = review;

  const existingReview = await Review.findOne({ userId, productId });

  if (existingReview) {
    throw new Error("Review already exists");
  }

  if (!rating || !comment) {
    throw new Error("Rating and comment are required");
  }
  const image = reviewImage ? reviewImage : "";

  try {
    const newReview = new Review({
      userId,
      productId,
      rating,
      comment,
      reviewImage: image,
    });
    await newReview.save();
    return newReview;
  } catch (error) {
    throw error;
  }
};

const getProductsCountByAdminId = async (adminId) => {
  try {
    const count = await Product.countDocuments({ adminId });
    return count;
  } catch (error) {
    throw error;
  }
};

const getProductStatus = async (adminId) => {
  try {
    // Get all product IDs
    const allProducts = await Product.find({ adminId }, "_id name").lean();
    // Get counts of reviews for each product
    const reviewsByProduct = await Review.aggregate([
      {
        $group: {
          _id: "$productId", // Group by productId
          reviewCount: { $sum: 1 }, // Count reviews
        },
      },
    ]);

    // Map product IDs to review counts
    const reviewCountsMap = new Map(
      reviewsByProduct.map((item) => [item._id.toString(), item.reviewCount])
    );

    // Determine reviewed and not reviewed products
    let reviewedCount = 0;
    let notReviewedCount = 0;
    let mostReviewedProduct = { name: "N/A", reviewCount: 0 };
    const totalProduct = allProducts.length;

    for (const product of allProducts) {
      const reviewCount = reviewCountsMap.get(product._id.toString()) || 0;

      if (reviewCount > 0) {
        reviewedCount++;
        if (reviewCount > mostReviewedProduct.reviewCount) {
          mostReviewedProduct = {
            name: product.name,
            reviewCount,
          };
        }
      } else {
        notReviewedCount++;
      }
    }

    // Send the response
    return {
      reviewedCount,
      notReviewedCount,
      mostReviewedProduct,
      totalProduct,
    };
  } catch (error) {
    throw error;
  }
};

const getReviewCountByStatus = async () => {
  try {
    const reviewByStatus = await Review.aggregate([
      {
        $group: {
          _id: "$reviewStatus",
          count: { $sum: 1 },
        },
      },
    ]);
    return reviewByStatus;
  } catch (error) {
    throw error;
  }
};

const getReviews = async () => {
  try {
    // Aggregate reviews grouped by status and productId
    const reviewsByStatus = await Review.aggregate([
      {
        $lookup: {
          from: "products", // Name of the Product collection
          localField: "productId", // Field in Review that links to Product
          foreignField: "_id", // Field in Product that matches Review's productId
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails", // Flatten the product details array
      },
      {
        $lookup: {
          from: "users", // Name of the User collection
          localField: "userId", // Field in Review that links to User
          foreignField: "_id", // Field in User that matches Review's userId
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails", // Flatten the user details array
      },
      {
        $group: {
          _id: { status: "$reviewStatus", productId: "$productId" }, // Group by both status and productId
          reviews: {
            $push: {
              reviewId: "$_id",
              comment: "$comment",
              rating: "$rating",
              userName: "$userDetails.username",
              profileImage: "$userDetails.profileImage",
            },
          },
          productName: { $first: "$productDetails.name" },
          productPrice: { $first: "$productDetails.price" }, // Grab product name
          productImage: { $first: "$productDetails.mainImage" }, // Grab product category
        },
      },
      {
        $facet: {
          pending: [
            { $match: { "_id.status": "pending" } },
            {
              $project: {
                reviews: 1,
                productName: 1,
                productPrice: 1,
                productImage: 1,
              },
            },
          ],
          approved: [
            { $match: { "_id.status": "approved" } },
            {
              $project: {
                reviews: 1,
                productName: 1,
                productPrice: 1,
                productImage: 1,
              },
            },
          ],
          rejected: [
            { $match: { "_id.status": "rejected" } },
            {
              $project: {
                reviews: 1,
                productName: 1,
                productPrice: 1,
                productImage: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          pending: { $ifNull: ["$pending", []] }, // If no pending reviews, return an empty array
          approved: { $ifNull: ["$approved", []] }, // If no approved reviews, return an empty array
          rejected: { $ifNull: ["$rejected", []] }, // If no rejected reviews, return an empty array
        },
      },
    ]);

    // Transform result into desired format
    const formattedResult = {
      pending: reviewsByStatus[0]?.pending || [],
      approved: reviewsByStatus[0]?.approved || [],
      rejected: reviewsByStatus[0]?.rejected || [],
    };

    return formattedResult;
  } catch (error) {
    throw error;
  }
};

const updateReviewStatus = async ({ reviewId, status, adminId }) => {
  try {
    const review = await Review.findByIdAndUpdate(
      { _id: reviewId },
      { reviewStatus: status, adminId, decisionDate: new Date() },
      { new: true }
    );
    if (!review) {
      throw new Error("Review not found");
    }
    return review;
  } catch (error) {
    throw error;
  }
};

const getAllProductsByAdmin = async (adminId) => {
  try {
    const products = await Product.find({ adminId }).lean();
    return products;
  } catch (error) {
    throw error;
  }
};

const deleteProductById = async (productId) => {
  try {
    // Delete the product by its ID
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      throw new Error("Product not found");
    }

    // Delete all reviews associated with the product ID
    await Review.deleteMany({ productId });

    return deletedProduct;
  } catch (error) {
    throw error;
  }
};

const updateProductById = async (productId, productDetail) => {
  try {
    const product = await Product.findByIdAndUpdate(productId, productDetail, {
      new: true,
    });
  } catch (error) {
    throw error;
  }
};

const deleteProductReviewById = async (reviewId) => {
  try {
    await Review.findByIdAndDelete(reviewId);
  } catch (error) {
    throw error;
  }
};
export default {
  createProduct,
  getProducts,
  getProductById,
  getProductReviews,
  addProductReview,
  getProductsCountByAdminId,
  getReviewCountByStatus,
  getProductStatus,
  getReviews,
  updateReviewStatus,
  getAllProductsByAdmin,
  updateProductById,
  deleteProductById,
  deleteProductReviewById,
};
