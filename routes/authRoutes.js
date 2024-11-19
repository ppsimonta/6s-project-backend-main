const dotenv = require('dotenv').config()
const express = require('express');
const router = express.Router();
const cors = require('cors');
const authService = require('../services/authService');
const { 
    test, registerUser, loginUser, getProfile, forgotPassword, resetPassword, 
    logoutUser, verifyEmail, anonymizeUser, updateUserName, getUsers, updateUserRole 
} = require('../controllers/authController');
const jwt = require('jsonwebtoken');

// middleware
router.use(
    cors({
        credentials: true,
        origin: process.env.WEBSITE_ADDRESS
    })
);

// Lisää authService tässä
router.use((req, res, next) => {
    req.authService = authService;
    next();
});

const requireLoggedInUser = async (req, res, next) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, async (err, claims) => {
            if (err) {
                res.status(401).json({ err: 'Unauthorized' });
                return;
            }

            // Käytä claims.jti hakeaksesi käyttäjä
            const loggedInUser = await req.authService.getUserByJti(claims.jti);

            if (loggedInUser == null) {
                res.status(401).json({ err: 'Unauthorized' });
                return;
            }

            req.loggedInUser = loggedInUser;
            next();
        });
    } else {
        res.status(401).json({ err: 'Unauthorized' });
    }
};

const requireAdmin = (req, res, next) =>{
    if(req.loggedInUser.role === "admin"){
        next()
    } else {
        res.status(403).json({ err: 'Forbidden' })
    }

}

const requireOperator = (req, res, next) =>{
    if(req.loggedInUser.role === "operator" | req.loggedInUser.role === "admin"){
        next()
    } else {
        res.status(403).json({ err: 'Forbidden' })
    }

}

//routes
router.get('/', test);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', requireLoggedInUser, getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:id/:token', resetPassword);
router.post('/logout', requireLoggedInUser, logoutUser);
router.get('/verify/:token', verifyEmail);
router.delete('/delete/:id', anonymizeUser);
router.put('/update-username/:id', requireLoggedInUser, updateUserName);
router.get('/user', requireLoggedInUser, requireAdmin, getUsers);
router.put('/update-role/:id', requireLoggedInUser, requireAdmin, updateUserRole);
router.delete('/delete-user/:id', requireLoggedInUser, requireAdmin, anonymizeUser);
/* router.get('/user/:id') */

module.exports = {router, requireLoggedInUser, requireAdmin, requireOperator}
