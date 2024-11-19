const mongoose = require('mongoose');
const {Schema} = mongoose

const questionSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    type: {
        type: Schema.Types.String,
        required: true
    },
    value: {
        type: Schema.Types.Mixed,
        required: true
    }
});

// questions mixed data type example:
// there are three types of questions; rating, freeform and image.
//
//
// questions: [
//     {
//         question: "Overall cleanliness",
//         type: "rating",
//         value: 0
//     },
//     {
//         question: "Upload your own image here",
//         type: "image",
//         value: "base64_data_url_goes_here"
//     },
//     {
//         question: "Give your own feedback",
//         type: "freeform",
//         value: "It was pretty clean"
//     },
// ]

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
