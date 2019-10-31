const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const quizSchema = new Schema({    
    questionSubject: {
        type: String,
        required: true
    },
    questionDetail: {
        type: String,
        required: true
    },
    questionImage: {
        type: String        
    },
    questionAnswer: {
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

module.exports = mongoose.model('Quiz', quizSchema);