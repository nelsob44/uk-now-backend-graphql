const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
    
    localRatingNo: {
        type: Number,
        required: true
    }, 
    ratingDate: {
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
module.exports = mongoose.model('Rating', ratingSchema);
