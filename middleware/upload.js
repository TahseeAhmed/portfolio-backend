const multer = require("multer");

let cloudinary, CloudinaryStorage;
let cloudinaryAvailable = false;

try {
  cloudinary = require("cloudinary").v2;
  const pkg = require("multer-storage-cloudinary");
  CloudinaryStorage = pkg.CloudinaryStorage;

  if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    cloudinaryAvailable = true;
  }
} catch (e) {
  console.log("Cloudinary not available");
}

const memoryStorage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed"), false);
};

const profileStorage = cloudinaryAvailable
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "tahseen-portfolio/profile",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
    })
  : memoryStorage;

const projectStorage = cloudinaryAvailable
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "tahseen-portfolio/projects",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
    })
  : memoryStorage;

const cvStorage = cloudinaryAvailable
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "tahseen-portfolio/cv",
        allowed_formats: ["pdf"],
        resource_type: "raw",
      },
    })
  : memoryStorage;

const uploadProfileImage = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
const uploadProjectImage = multer({
  storage: projectStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
const uploadCV = multer({
  storage: cvStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = {
  cloudinary,
  uploadProfileImage,
  uploadProjectImage,
  uploadCV,
};
