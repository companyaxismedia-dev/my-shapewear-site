const Product = require("../models/Product");
const { Page } = require("../models/Banner");
const { cached } = require("../utils/cache");

const CACHE_TTL = 2 * 60 * 1000;
const PRODUCT_CARD_SELECT =
  "name slug thumbnail category subCategory variants.color variants.images.url variants.sizes.size variants.sizes.stock minPrice mrp discount rating numReviews shortDescription";

const toHeroSlides = (sections = []) =>
  sections
    .filter((section) => section.type === "hero_slider")
    .flatMap((section) =>
      (section.blocks || []).map((block) => ({
        _id: block._id,
        desktopUrl: block.data?.desktopUrl || block.data?.image,
        mobileUrl: block.data?.mobileUrl,
        link: block.data?.link,
        altText: block.data?.altText,
      }))
    );

const toPageSections = (page, now = new Date()) => {
  if (!page) return [];

  return (page.sections || [])
    .filter((section) => {
      if (!section.active) return false;
      if (section.startDate && now < section.startDate) return false;
      if (section.endDate && now > section.endDate) return false;
      if (!section.blocks || !section.blocks.length) return false;
      return true;
    })
    .map((section) => ({
      _id: section._id,
      type: section.type,
      layoutType: section.layoutType,
      rows: section.rows,
      columns: section.columns,
      title: section.title,
      order: section.order,
      settings: section.settings,
      blocks: (section.blocks || []).map((block) => ({
        _id: block._id,
        order: block.order,
        data: block.data,
      })),
    }));
};

exports.getHomeStorefront = async (req, res) => {
  try {
    const payload = await cached("storefront:home", CACHE_TTL, async () => {
      const page = await Page.findOne({ slug: "home" })
        .populate({
          path: "sections",
          options: { sort: { order: 1, createdAt: 1 } },
          populate: {
            path: "blocks",
            options: { sort: { order: 1, createdAt: 1 } },
          },
        })
        .lean();

      const sections = toPageSections(page);
      const heroSlides = toHeroSlides(sections);

      const productRails = await Product.aggregate([
        { $match: { isActive: true, status: "published" } },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            featured: [
              { $match: { isFeatured: true } },
              { $limit: 12 },
              { $project: productProjection() },
            ],
            bestSellers: [
              { $match: { isBestSeller: true } },
              { $sort: { rating: -1 } },
              { $limit: 12 },
              { $project: productProjection() },
            ],
            newArrivals: [
              { $match: { isNewArrival: true } },
              { $limit: 12 },
              { $project: productProjection() },
            ],
          },
        },
      ]);

      return {
        success: true,
        sections,
        heroSlides,
        rails: productRails[0] || {
          featured: [],
          bestSellers: [],
          newArrivals: [],
        },
      };
    });

    res.set("Cache-Control", "public, max-age=120, stale-while-revalidate=600");
    res.json(payload);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load storefront",
    });
  }
};

function productProjection() {
  return {
    name: 1,
    slug: 1,
    thumbnail: 1,
    category: 1,
    subCategory: 1,
    "variants.color": 1,
    "variants.images.url": 1,
    "variants.sizes.size": 1,
    "variants.sizes.stock": 1,
    minPrice: 1,
    mrp: 1,
    discount: 1,
    rating: 1,
    numReviews: 1,
    shortDescription: 1,
  };
}

exports.PRODUCT_CARD_SELECT = PRODUCT_CARD_SELECT;
