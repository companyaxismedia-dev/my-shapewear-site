const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure folder exists
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    // Check if this is a banner/block upload (admin routes with blocks or banner endpoint)
    const isBannerUpload = req.baseUrl.includes('banner') || 
                          req.path.includes('blocks') || 
                          req.path.includes('sections');
    
    if (isBannerUpload) {
      uploadPath = "uploads/banner/";
    } else {
      uploadPath = "uploads/products/";
      if (file.mimetype.startsWith("image/")) {
        uploadPath += "images/";
      } else if (file.mimetype.startsWith("video/")) {
        uploadPath += "videos/";
      } else {
        return cb(new Error("Only images and videos are allowed"));
      }
    }
    console.log(`📁 Upload path for ${file.originalname}: ${uploadPath}`);
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
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