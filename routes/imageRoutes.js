const express = require('express');
const multer = require('multer');
const path = require('path');
const {generateImageController,generateSquareImage,generateBothImages,saveMatchData} = require('../controllers/generateImageController');

const router = express.Router();

// Set up multer for file uploads


// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Define the route for image generation
router.post('/generate-image', generateImageController);
router.post('/generate-image/square', generateSquareImage);
router.post('/generate-image/combined', generateBothImages);
router.post('/save', saveMatchData);


module.exports = router;
