const dotenv = require('dotenv').config()
const User = require('../models/user');
const {hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken'); 
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');
const {generateToken, generateJti, generateVerificationToken} = require('../helpers/tokenHelper');

// Register
module.exports.registerUser = async (name, email, password) => {
    if (!name || !password || password.length < 6) {
        throw new Error('Invalid input data');
    }

    const exist = await User.findOne({ email });
    if (exist) {
        throw new Error('Email already in use');
    }

    const domain = email.split('@')[1];
    let role = 'user';

    if (email === process.env.ADMIN_EMAIL) {
        role = 'admin';
    } else if (domain === process.env.OPERATOR_DOMAIN) {
        role = 'operator';
    }

    const hashedPassword = await hashPassword(password);

    // Luodaan varmennustoken
    const verificationToken = generateVerificationToken();

    // Tallenna käyttäjärekisteröinti väliaikaisesti
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        isVerified: false,
        verificationToken: verificationToken,
    });

    // Lähetä varmennusviesti käyttäjän sähköpostiin
    sendVerificationEmail(email, verificationToken);
    return user; // Palauta käyttäjä, jotta voit tallentaa sen myöhemmin
};

// Lähetä varmennusviesti
const sendVerificationEmail = (email, token) => {
    const verificationLink = `${process.env.WEBSITE_ADDRESS}/verify/${token}`;

    const msg = {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Account Verification',
        text: 'Please verify your email address',
        html: `<a href="${verificationLink}">Click here to verify your email address</a>`,
    };

    sgMail.send(msg);
};


//LOGIN
module.exports.authenticateUser = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        return null; // Palauta null, jos käyttäjää ei löydy
    }

    if (!user.isVerified) {
        throw new Error('Email not verified');
    }

    const match = await comparePassword(password, user.password);

    if (match) {
        // Generoi uusi jti-arvo
        const jti = generateJti();
        
        const token = await generateToken(user._id, jti);

        // Tallenna jti-kenttä käyttäjän tietoihin
        user.jti = jti;
        await user.save();

        return { user, token };
    }

    return null; // Palauta null, jos salasanat eivät täsmää
};

// Get Profile
module.exports.getUserByJti = async (jti) => {
    try {
        const user = await User.aggregate([
            { $match: { jti: jti } },
            {
                $project: {
                    id: '$_id', // Rename _id to id
                    _id: 0, // Hide _id
                    name: 1,
                    email: 1,
                    password: 1,
                    jti: 1,
                    role: 1,
                    verificationToken: 1,
                    isVerified: 1,
                }
            }
        ]);

        if (user.length > 0) {
            return user[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
};


// Forgot Password
module.exports.forgotPassword = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('User does not exist');
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2min' });

    const msg = {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Password reset',
        text: 'Reset your password',
        html: ` ${process.env.WEBSITE_ADDRESS}/reset-password/${user._id}/${token} `,
    };

    await sgMail.send(msg);
};

// Reset Password
module.exports.resetPassword = async (id, token, newPassword) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                reject(new Error('Error with token'));
            } else {
                bcrypt.hash(newPassword, 10)
                    .then(hash => {
                        User.findByIdAndUpdate({ _id: id }, { password: hash })
                            .then(() => {
                                resolve({ Status: 'Password changed' });
                            });
                    });
            }
        });
    });
};

// Logout
module.exports.logoutUser = async (jti) => {
    try {
        // Poista käyttäjän jti-kenttä tietokannasta
        await User.updateOne({ jti }, { $unset: { jti: 1 } });
        return { message: 'User logged out successfully' };
    } catch (error) {
        console.error('Virhe uloskirjautumisessa:', error);
        return { error: 'Internal Server Error' };
    }
};

//change username
module.exports.updateUserName = async (userId, newName) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw error('User not found');
        }

        // Päivitä nimi
        user.name = newName;

        // Tallenna päivitetyt tiedot
        await user.save();

        return { message: 'User information updated successfully' };
    } catch (error) {
        console.error('Error updating user information:', error);
        return { error: 'Internal Server Error' };
    }
};

//delete/anonymize user

module.exports.anonymizeUser = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw error('User not found');
        }
         // Anonymisoi tiedot
         user.name = 'Anonymous';
         user.email = `user${userId}@example.com`;
         user.password = ''; 
         user.verificationToken = null; 
         user.isVerified = false;
         user.jti = null;
 
         // Tallenna anonymisoidut tiedot
         await user.save();

         return { message: 'User anonymized successfully' };
    } catch (error) {
        console.error('Error anonymizing user:', error);
        return { error: 'Internal Server Error' };
    }
};

module.exports.getUsers = async () => {
    try {
        const users = await User.aggregate([
            {
                $project: {
                    id: '$_id',
                    name: 1,
                    email: 1,
                    role: 1,
                    _id: 0  // Exclude _id field
                }
            }
        ]);

        return users
    } catch (error) {
        return error
    }
}

module.exports.updateUserRole = async (userId, newRole) =>  {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { role: newRole },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return { message: 'User role updated successfully', user };
    } catch (error) {
      console.error('Error updating user role:', error);
      return { error: 'Internal Server Error' };
    }
  };

  
