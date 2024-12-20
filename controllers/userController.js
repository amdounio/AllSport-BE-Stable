const {User} = require('../config/relation');
const nodemailer = require('nodemailer'); 


const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
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

const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId, {
            attributes: { 
                exclude: ['password', 'stripeCustomerId'] // Exclude sensitive data
            }
        });

        if (!user) {
            return res.status(404).json({ 
                status: 'error',
                message: 'User not found' 
            });
        }

        res.status(200).json({
            status: 'success',
            user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error fetching user information'
        });
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

const getGeneratedImagesCount = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            userId: user.id,
            generatedImagesCount: user.generatedImagesCount,
            status: 'success'
        });
    } catch (error) {
        console.error('Error fetching generated images count:', error);
        res.status(500).json({ error: 'Error fetching generated images count' });
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
    const { id, oldPassword, newPassword } = req.body;
  
    try {
        const user = await User.findOne({ where: { id } }); // Use `id` instead of `email`
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
// Edit user information handler
const editUserInfo = async (req, res) => {
    const {
        id, // Use `id` instead of `email` to find the user
        name,
        firstName,
        lastName,
        provider,
        acceptLegalPolicy,
        
        // Step two fields
        businessName,
        buisnessType,
        adresse,
        phone,
        companyName,
        
        // Step three fields
        newUser,
        role,
        plan,

        // Favorite sports fields
        favoriteSport,
        favoriteLeague,

        // Additional fields
        establishmentCapacity,
        sports,
        frequencyMatchBroadcasts,
        monthlyBudgetEventPromotion,
        mainObjectiveUsing,
        devicesUsedAccess,
        commentsSpecificNeeds,

        // Existing fields to retain
        password,
        ssoData,
    } = req.body;

    const logo = req.file ? req.file.filename : null;
    const photoUrl = `/public/profile-photos/${req.file.filename}`;

    try {

     
        const user = await User.findOne({ where: { id } }); // Find user by `id`
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user information only if provided
        user.name = name || user.name;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.photoUrl = photoUrl || user.photoUrl;
        user.provider = provider || user.provider;
        user.acceptLegalPolicy = acceptLegalPolicy !== undefined ? acceptLegalPolicy : user.acceptLegalPolicy;

        // Step two fields
        user.businessName = businessName || user.businessName;
        user.buisnessType = buisnessType || user.buisnessType;
        user.adresse = adresse || user.adresse;
        user.phone = phone || user.phone;
        user.companyName = companyName || user.companyName;

        // Step three fields
        user.newUser = newUser !== undefined ? newUser : user.newUser;
        user.role = role || user.role;
        user.plan = plan || user.plan;

        // Favorite sports fields
        user.favoriteSport = favoriteSport || user.favoriteSport;
        user.favoriteLeague = favoriteLeague || user.favoriteLeague;

        // Additional fields
        user.establishmentCapacity = establishmentCapacity || user.establishmentCapacity;
        user.sports = sports || user.sports;
        user.frequencyMatchBroadcasts = frequencyMatchBroadcasts || user.frequencyMatchBroadcasts;
        user.monthlyBudgetEventPromotion = monthlyBudgetEventPromotion || user.monthlyBudgetEventPromotion;
        user.mainObjectiveUsing = mainObjectiveUsing || user.mainObjectiveUsing;
        user.devicesUsedAccess = devicesUsedAccess || user.devicesUsedAccess;
        user.commentsSpecificNeeds = commentsSpecificNeeds || user.commentsSpecificNeeds;

        // Existing fields to retain
        user.password = password || user.password;
        user.ssoData = ssoData || user.ssoData;

        await user.save();

        res.status(200).json({ 
            message: 'User information updated successfully',
            user,
            status: 'success',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating user information' });
    }
};

const getCurrentSubscription = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            userId: user.id,
            currentPlan: user.plan || 'Free', // Default to 'Free' if no plan is set
            status: 'success'
        });
    } catch (error) {
        console.error('Error fetching current subscription:', error);
        res.status(500).json({ error: 'Error fetching subscription information' });
    }
};





const updateUserPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { userId } = req.body;
        const user = await User.findByPk(userId);

        if (!user) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.photoUrl) {
            const oldPhotoPath = path.join(__dirname, '..', user.photoUrl);
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }

        const photoUrl = `/public/profile-photos/${req.file.filename}`;
        user.photoUrl = photoUrl;
        await user.save();

        res.status(200).json({
            message: 'Photo uploaded successfully',
            photoUrl: photoUrl,
            user :user,
            status: 'success'
        });

    } catch (error) {
        console.error('Error uploading photo:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Error uploading photo' });
    }
};

module.exports = { updateUserPhoto,getUserById,createUser, getUsers, forgotPassword, editPassword, editUserInfo ,getGeneratedImagesCount,getCurrentSubscription};