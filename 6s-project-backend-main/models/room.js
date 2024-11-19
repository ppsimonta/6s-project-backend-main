const mongoose = require('mongoose')
const {Schema} = mongoose

const roomSchema = new Schema({
    name: {
        type: String,
        unique: false,
        require: true
    },
    zone: {
        type: String,
    },
    floor: {
        type: Number,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value.'
        }
    },
    location: {
        type: String,
        unique: false,
        require: true
    },
    info: [{
        type: Schema.Types.Mixed,
        required: false
    }],
})

// info mixed data type example:
//
// info: [
//     {
//         text: "Room special instructions",
//         type: "plaintext"
//     },
//     {
//         text: "https://192.168.1.1",
//         type: "url"
//     }
// ]

const RoomModel = mongoose.model('Room', roomSchema);

module.exports = RoomModel