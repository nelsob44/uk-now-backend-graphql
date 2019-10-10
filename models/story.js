const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const storySchema = new Schema({
    storyTitle: {
        type: String,
        required: true
    },
    storyDetail: {
        type: String,
        required: true
    },
    storyImage: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    postedOn: {
        type: String,
        required: true
    },
    storyLikes: {
        type: Number,
        required: true
    },
    storyLikers: [
        
    ],
    youtubeLinkString: {
        type: String,
        required: false
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
{ timestamps: true }
);

module.exports = mongoose.model('Story', storySchema);