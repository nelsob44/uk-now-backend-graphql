const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const resultSchema = new Schema({    
    userName: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    isWinner: {
        type: Boolean,
        default: false
    },
    subject: {
        type: String,
        required: true
    },
    score: {
        type: String,
        required: true
    }
},
{ timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);