const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        default: 3
    },
    questions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Question'
        }
    ],
    mentors: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Mentor'
        }
    ],
    essentials: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Essential'
        }
    ],
    locals: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Local'
        }
    ],
    blogs: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Blog'
        }
    ],
    stories: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Story'
        }
    ],
    events: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Event'
        }
    ]
});

module.exports = mongoose.model('User', userSchema);