const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    commentDetails: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }, 
    blogDate: {
        type: String,
        required: true
    }, 
    userName: {
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

module.exports = commentSchema;