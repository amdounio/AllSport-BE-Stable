const express = require('express');
const multer = require('multer');
const path = require('path');
const {generateImageController,generateSquareImage,generateBothImages,saveMatchData} = require('../controllers/generateImageController');

const router = express.Router();

// Set up multer for file uploads
const upload = multer({
  dest: path.join(__dirname, '../uploads'),
});

// Define the route for image generation
router.post('/generate-image', generateImageController);
router.post('/generate-image/square', generateSquareImage);
router.post('/generate-image/combined', generateBothImages);
router.post('/save', saveMatchData);


module.exports = router;
