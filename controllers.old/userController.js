const User = require('../models/User');
const nodemailer = require('nodemailer'); 
// Create a new user
const createUser = async (req, res) => {
    const { username, email, password, ssoData } = req.body; // Add ssoData to the destructured fields
    try {
        const user = await User.create({ 
            username, 
            email, 
            password, 
            ssoData: ssoData || null // Store SSO data, default to null if not provided
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: 'Error creating user' });
    }
};

// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Generate a password reset token (this could be JWT or any token mechanism)
      const resetToken = generateResetToken(); // Implement this function to generate a token

      // Send email with the reset link
      await sendResetEmail(user.email, resetToken); // Implement this function

      res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
      res.status(500).json({ error: 'Error sending password reset email' });
  }
};

// Function to send the reset email
const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
      service: 'Gmail', // or your email service
      auth: {
          user: process.env.EMAIL_USER, // your email
          pass: process.env.EMAIL_PASS, // your email password
      },
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `You requested a password reset. Click here to reset your password: ${resetUrl}`,
  };

  await transporter.sendMail(mailOptions);
};

// Dummy token generation function (you should implement a proper token mechanism)
const generateResetToken = () => {
  // Ideally, use a library like jsonwebtoken or UUID
  return Math.random().toString(36).substring(2, 15); // Simple random token
};


const editPassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Check if old password matches
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
          return res.status(400).json({ error: 'Incorrect old password' });
      }

      // Hash the new password and update it
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
      res.status(500).json({ error: 'Error updating password' });
  }
};

// Edit user information handler
const editUserInfo = async (req, res) => {
  const { email, username, ssoData } = req.body;

  try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Update user information
      user.username = username || user.username; // Only update if provided
      user.ssoData = ssoData || user.ssoData; // Only update if provided
      await user.save();

      res.status(200).json({ message: 'User information updated successfully', user });
  } catch (error) {
      res.status(500).json({ error: 'Error updating user information' });
  }
};


module.exports = { createUser, getUsers, forgotPassword, editPassword, editUserInfo };