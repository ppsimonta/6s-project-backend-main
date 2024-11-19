const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Generoi uusi jti-arvo
const generateJti = () => {
    return uuidv4();
};

// Generate jwt token with jti
module.exports.generateToken = async (userId, jti) => {
    const expiresIn = 2592000;

    // Generoi uusi jti-arvo
    //const jti = generateJti();

    const token = jwt.sign(
        { userId, jti },
        process.env.JWT_SECRET,
        { expiresIn }
    );

    return token;
};

// Generate email verification token 
module.exports.generateVerificationToken = () => {
    const token = require('crypto').randomBytes(20).toString('hex'); // Luo satunnainen token
    return token;
};

module.exports.generateJti = generateJti;
