const express = require('express');
const { updateUserPhoto,getUserById,createUser, getUsers, forgotPassword, editPassword, editUserInfo,getGeneratedImagesCount ,getCurrentSubscription} = require('../controllers/userController');
const router = express.Router();


const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');



// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/profile-photos')
    },
    filename: function (req, file, cb) {
        const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueFileName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});



// POST route for creating a user
router.post('/users', createUser);

// GET route for fetching all users
router.get('/users', getUsers);
router.post('/forgot-password', forgotPassword);


router.put('/edit-password', editPassword); /*
{
    "email": "user@example.com",
    "oldPassword": "oldPassword123",
    "newPassword": "newPassword456"
}
    */
router.put('/edit-info', upload.single('logo'), editUserInfo);
/*
{
    "email": "user@example.com",
    "username": "newUsername",
    "ssoData": {"google": "googleId", "icloud": "icloudId"}
}
*/

router.get('/users/:userId/generated-images-count', getGeneratedImagesCount);
router.get('/users/:userId/subscription', getCurrentSubscription);

router.get('/users/:id', getUserById);
router.post('/users/upload-photo', upload.single('photo'), updateUserPhoto);

module.exports = router;
