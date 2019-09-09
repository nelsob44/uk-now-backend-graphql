const mongoose = require('mongoose');
const Blogcomment = require('./comment');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    blogTitle: {
        type: String,
        required: true
    },
    blogDetails: {
        type: String,
        required: true
    },
    blogImage: {
        type: String,
        required: true
    },
    blogFirstName: {
        type: String,
        required: true
    },
    blogLastName: {
        type: String,
        required: true
    },
    blogDate: {
        type: Date,
        required: true
    },
    blogLikes: {
        type: Number,
        required: true
    },
    blogComments: [
        {
            type: Blogcomment            
        }
    ],    
    blogLikes: {
        type: Number,
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

module.exports = mongoose.model('Blog', blogSchema);