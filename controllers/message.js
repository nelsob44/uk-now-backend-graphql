const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');
const io = require('../socket');

const Message = require('../models/message');
const User = require('../models/user');


exports.addMessage = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
        
    const messageFrom = req.body.messageFrom;
    const messageTo = req.body.messageTo;
    const messageImage = req.body.messageImage.replace("\\" ,"/");
    const messageDetails = req.body.messageDetails;
    const messageTime = new Date().getTime(); 
    const messageRead = false;   
    const creator = req.userId; 
    const session = [];
    session.push(messageFrom);
    session.push(messageTo);


    const message = new Message({
        messageFrom: messageFrom,
        messageTo: messageTo,
        messageSession: session,
        messageDetails: messageDetails,
        messageImage: messageImage,
        messageTime: messageTime, 
        messageRead: messageRead,       
        creator: creator        
    });
    
    try {
        await message.save();
        io.getIO().emit('message', { action: 'addMessage', message: message });
        res.status(201).json({ message: message });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getMessages = async (req, res, next) => {
    const currentPage = req.body.pageNumber || 1;
    const perPage = 10;
    const messageFrom = req.body.messageFrom;
    const messageTo = req.body.messageTo;
    
  try {
      const messages = await Message.find({ messageSession: { $all: [messageFrom, messageTo] } })      
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    
    res.status(200).json({ messages: messages });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateReadMessages = async (req, res, next) => {
    const currentPage = req.body.pageNumber || 1;
    const perPage = 10;
    const messageFrom = req.body.messageFrom;
    const messageTo = req.body.messageTo;
    const messageIds = [];
    
  try {
      const messages = await Message.find({ 
        messageSession: { $all: [messageFrom, messageTo] }, 
        messageRead: false, messageFrom: messageTo 
      }).sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
      
    messages.forEach(msg => {
      msg.messageRead = true;
      messageIds.push(msg._id);
      msg.save();
    });
    
    res.status(200).json({ messages: messages });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getMessagesFilter = async (req, res, next) => {
  
  const messagesFrom = [];
  const messageTo = req.body.messageTo;
  
  try {
      const messages = await Message.find({ messageTo: messageTo, messageRead: false })      
      .sort({ createdAt: -1 });

      messages.forEach(msg => {   
        let sendingUser = msg.messageFrom + '/' + msg.creator;
        if(!messagesFrom.includes(sendingUser)) {
          messagesFrom.push(sendingUser);
        }      
      });      
          
    res.status(200).json({ messagesFrom: messagesFrom });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteItem = async (req, res, next) => {
  const itemId = req.params.itemId;
    
  mentor = await Mentor.findById(itemId);
  
  try {    

    if (!mentor) {
      const error = new Error('Could not find item to delete.');
      error.statusCode = 404;
      throw error;
    }

    clearImage(mentor.mentorImage);
    
    const user = await User.findById(req.userId);
        
    user.mentors.pull(itemId);
    await user.save();
    
    await Mentor.deleteOne({_id: itemId});   
    
    res.status(200).json({ message: 'Mentor deleted' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};

