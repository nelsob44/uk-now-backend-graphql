const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({    
    messageFrom: {
        type: String,
        required: true
    },
    messageTo: {
        type: String,
        required: true
    },
    messageSession: {
        type: [],
        required: true
    },
    messageDetails: {
        type: String        
    },
    messageImage: {
        type: String        
    },
    messageTime: {
        type: Date
    },
    messageRead: {
        type: Boolean,
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

module.exports = mongoose.model('Message', messageSchema);