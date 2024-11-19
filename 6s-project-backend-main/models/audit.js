const mongoose = require('mongoose');
const {Schema} = mongoose

const auditSchema = new Schema({
    questions: [{
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    }],
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approved: {
        type: Schema.Types.Boolean,
        required: true
    },
    date: {
        type: Schema.Types.Date,
        required: true
    }
});

const Audit = mongoose.model('Audit', auditSchema);

module.exports = Audit;
