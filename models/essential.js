const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const essentialSchema = new Schema({
    essentialsDetails: {
        type: String,
        required: true
    },
    essentialsImage: {
        type: String,
        required: true
    },
    essentialsTime: {
        type: Date,
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

module.exports = mongoose.model('Essential', essentialSchema);