const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderName;
    const isCategoryUpload = req.baseUrl?.includes("admin") && req.path?.includes("/categories");
    const isBannerUpload = req.baseUrl?.includes('banner') || 
                          req.path?.includes('blocks') || 
                          req.path?.includes('sections');
    
    if (isCategoryUpload) {
      folderName = "imkaa/categories/images";
    } else if (isBannerUpload) {
      folderName = "imkaa/banner";
    } else {
      if (file.mimetype.startsWith("image/")) {
        folderName = "imkaa/products/images";
      } else if (file.mimetype.startsWith("video/")) {
        folderName = "imkaa/products/videos";
      } else {
        folderName = "imkaa/others";
      }
    }

    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);

    return {
      folder: folderName,
      public_id: uniqueName,
      resource_type: file.mimetype.startsWith("video/") ? "video" : "auto",
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

module.exports = upload;