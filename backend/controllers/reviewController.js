const Product = require("../models/Product");

const getHomeReviews = async (req, res) => {
  try {
    const reviews = await Product.aggregate([
      {
        $match: {
          isActive: true,
          status: "published",
          reviews: { $exists: true, $ne: [] },
        },
      },
      {
        $unwind: "$reviews",
      },
      {
        $match: {
          "reviews.comment": { $exists: true, $ne: "" },
          "reviews.userName": { $exists: true, $ne: "" },
        },
      },
      {
        $project: {
          reviewId: "$reviews._id",
          userName: { $trim: { input: "$reviews.userName" } },
          rating: "$reviews.rating",
          comment: "$reviews.comment",
          verified: "$reviews.verified",
          createdAt: "$reviews.createdAt",
          productId: "$_id",
          productName: "$name",
          productSlug: "$slug",
          productThumbnail: "$thumbnail",
          productCategory: "$category",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },

      // same name repeat na ho homepage par
      {
        $group: {
          _id: { $toLower: "$userName" },
          review: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$review",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("getHomeReviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch home reviews",
      reviews: [],
    });
  }
};

module.exports = {
  getHomeReviews,
};