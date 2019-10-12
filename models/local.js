const mongoose = require('mongoose');
const ratingLocal = require('./ratingsconst');
const Schema = mongoose.Schema;

const localSchema = new Schema({
    localName: {
        type: String,
        required: true
    },
    localType: {
        type: String,
        required: true
    },
    localAddress: {
        type: String,
        required: true
    },
    localImage: {
        type: String,
        required: true
    },
    localContact: {
        type: String,
        required: true
    },
    localRating: {
        type: Number
    },
    ratings: [
        {
            type: ratingLocal            
        }
    ],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
{ timestamps: true }
);

module.exports = mongoose.model('Local', localSchema);