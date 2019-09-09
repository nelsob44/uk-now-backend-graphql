const mongoose = require('mongoose');
const Blogcomment = require('./comment');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    questionTitle: {
        type: String,
        required: true
    },
    questionDetails: {
        type: String,
        required: true
    },
    questionTime: {
        type: Date,
        required: true
    },
    questionReplies: [
        {
            type: Blogcomment            
        }
    ],
    questionUserName: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
{ timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);