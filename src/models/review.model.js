import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Assuming it's an ObjectId from the Users collection
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId, // Assuming it's an ObjectId from the Products collection
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5, // Ensures ratings are between 1 and 5
    },
    comment: {
      type: String,
      required: false,
      trim: true,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0, // Ensures votes cannot be negative
    },
    reviewStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // Default status is pending
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId, // Admin responsible for decision
      ref: "Admin",
      required: function () {
        return this.reviewStatus !== "pending"; // Required if review is approved/rejected
      },
    },
    decisionDate: {
      type: Date,
      required: function () {
        return this.reviewStatus !== "pending"; // Required if review is approved/rejected
      },
    },
    reviewImage: {
      type: String, // Stores URL or file path for the image
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now, // Sets the default to the current timestamp
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, // Automatically handles timestamps
  }
);

reviewSchema.statics.getAverageRating = async function (productId) {
  // Validate the productId first
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid productId");
  }

  // Safely create a new ObjectId

  const result = await this.aggregate([
    { $match: { productId } }, // Use the ObjectId instance
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  return result.length > 0 ? result[0].averageRating : 0;
};

const Review = mongoose.model("Review", reviewSchema);

export default Review;
