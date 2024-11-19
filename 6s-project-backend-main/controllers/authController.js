const User = require('../models/user')
const { hashPassword, comparePassword } = require('../helpers/auth')
const jwt = require('jsonwebtoken'); 
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');
const authService = require('../services/authService');
const generateToken = require('../helpers/tokenHelper');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


//controller for testing
const test = (req, res) => {
    res.json('test is workin?')
}

//Register endpoint
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await authService.registerUser(name, email, password);
        res.json(user);
} catch (error) {
        console.log(error);
        res.json({ error: error.message });
    }
};

//email verify endpoint
const verifyEmail = async (req, res) => {
    
    try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        throw new Error('Invalid verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verification successful' });
} catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
}
};

// Login endpoint
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const authResult = await authService.authenticateUser(email, password);

        if (authResult && authResult.token) {
            const token = authResult.token;

            // Tallenna jti-kenttä käyttäjän tietoihin
            const user = authResult.user;
            user.jti = authResult.user.jti;
            await user.save();

            res.cookie('token', token).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ error: 'Authentication failed' });
        }
    } catch (error) {
        console.log(error);
        res.json({ error: error.message });
    }
};

// nyt, kun meillä on käytössä requireLoggedInUser middleware, tänne ei edes tulla, jos
// käyttäjää ei löydy tietokannasta jti:n avulla
const getProfile = (req, res) => {

    return res.json({account: req.loggedInUser})
    console.log("user logged in")
}

//Get All Users
const getUsers = async (req, res) =>{
    try{
        const users = await req.services.authService.getUsers();
        res.json(users)
    } catch {
        res.status(500).json({ error: error.message })
    }

}

// Forgot Password endpoint
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        await authService.forgotPassword(email);
        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'User does not exist' });
    }
};

// Reset Password endpoint
const resetPassword = async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;
    try {
        const result = await authService.resetPassword(id, token, password);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({ error: error.message });
    }
};

// Logout endpoint
const logoutUser = async (req, res) => {
    try {
        // Pyydä jti requestista
        const jti = req.loggedInUser.jti;

        // Poista Jti ja selainevälineistä eväste
        res.clearCookie('token');

        const message = await authService.logoutUser(jti);
        res.json(message);
        console.log('User logged out successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update User Name endpoint
const updateUserName = async (req, res) => {
    try {
        // Pyydä käyttäjän ID ja uusi nimi requestista
        const { id } = req.params;
        const { newName } = req.body;

        // Päivitä käyttäjän nimi
        const result = await authService.updateUserName(id, newName);

        res.json(result);
        console.log('User name updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Delete User endpoint
const anonymizeUser = async (req, res) => {
    try {
        // Pyydä käyttäjän ID requestista
        const userId = req.params.id;

        // Anonyymitetaan käyttäjä
        const result = await authService.anonymizeUser(userId);

        res.json(result);
        console.log('User anonymized successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateUserRole = async (req, res) => {
    try {
      const { id } = req.params;
      const { newRole } = req.body;
  
      const result = await authService.updateUserRole(id, newRole);
  
      res.json(result);
      console.log('User role updated successfully');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

module.exports = {
    test,
    registerUser,
    loginUser,
    getProfile,
    forgotPassword,
    resetPassword,
    logoutUser,
    verifyEmail,
    anonymizeUser,
    updateUserName,
    getUsers,
    updateUserRole
}
