const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for profile images
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tahseen-portfolio/profile',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'fill', gravity: 'face' }],
  },
});

// Storage for project images
const projectStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tahseen-portfolio/projects',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 630, crop: 'fill' }],
  },
});

// File filter — images only
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// File filter — PDFs only
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// CV storage (Cloudinary raw)
const cvStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tahseen-portfolio/cv',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
  },
});

const uploadProfileImage = multer({ storage: profileStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadProjectImage = multer({ storage: projectStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadCV           = multer({ storage: cvStorage,      fileFilter: pdfFilter,   limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = { cloudinary, uploadProfileImage, uploadProjectImage, uploadCV };
