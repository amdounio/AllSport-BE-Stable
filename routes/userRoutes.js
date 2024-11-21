const express = require('express');
const { createUser, getUsers, forgotPassword, editPassword, editUserInfo } = require('../controllers/userController');
const router = express.Router();

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
router.put('/edit-info', editUserInfo);
/*
{
    "email": "user@example.com",
    "username": "newUsername",
    "ssoData": {"google": "googleId", "icloud": "icloudId"}
}
*/

module.exports = router;
