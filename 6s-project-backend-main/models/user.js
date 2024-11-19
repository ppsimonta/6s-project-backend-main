const mongoose = require('mongoose')
const {Schema} = mongoose

const userSchema = new Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    jti: String,
    role: String,
    verificationToken: String, 
    isVerified: Boolean
})

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel
