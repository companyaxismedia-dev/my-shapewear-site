const multer = require("multer");
const fs = require("fs");
const path = require("path");

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = "uploads/products/images";

    if (req.originalUrl.includes("/categories")) {
      dest = "uploads/categories/images";
    } else if (file.mimetype.startsWith("video/")) {
      dest = "uploads/products/videos";
    }

    const destPath = path.join(__dirname, "..", dest);
    ensureDir(destPath);
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});

const upload = multer({ storage });

module.exports = upload;
