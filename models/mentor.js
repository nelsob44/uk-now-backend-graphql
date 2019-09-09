const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const mentorSchema = new Schema({
    mentorUserName: {
        type: String,
        required: true
    },
    mentorProfile: {
        type: String,
        required: true
    },
    mentorField: {
        type: String,
        required: true
    },
    mentorImage: {
        type: String,
        required: true
    },
    mentorEmail: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
{ timestamps: true }
);

module.exports = mongoose.model('Mentor', mentorSchema);