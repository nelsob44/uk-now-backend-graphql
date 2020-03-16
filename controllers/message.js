const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

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
        creator: creator        
    });
    
    try {
        await message.save();

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

exports.getMessagesFilter = async (req, res, next) => {
  const currentPage = req.body.pageNumber || 1;
  const perPage = 10;
  const mentorField = req.body.mentorField;
  try {
    const totalItems = await Mentor.find().countDocuments();
    const mentors = await Mentor.find({"mentorField" : mentorField})      
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    
    res.status(200).json({
      message: 'Fetched mentors successfully.',
      mentors: mentors,
      totalItems: totalItems
    });
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

    // io.getIO().emit('posts', { action: 'delete', post: postId });
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

