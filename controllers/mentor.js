const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Mentor = require('../models/mentor');
const User = require('../models/user');


exports.addMentor = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
    if(!req.body.mentorImage) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const user = await User.findById(req.userId);
    
    const mentorUserName = req.body.mentorUserName;
    const mentorProfile = req.body.mentorProfile;
    const mentorImage = req.body.mentorImage.replace("\\" ,"/");
    const mentorField = req.body.mentorField;
    const mentorEmail = req.body.mentorEmail;    
    const creator = req.userId;
    

    const mentor = new Mentor({
        mentorUserName: mentorUserName,
        mentorProfile: mentorProfile,
        mentorField: mentorField,
        mentorImage: mentorImage,
        mentorEmail: mentorEmail,        
        creator: creator        
    });
    
    try {
        await mentor.save();

        user.mentors.push(mentor);
        await user.save();

        res.status(201).json({
            message: 'Mentor created',
            mentor: mentor            
        });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getMentors = async (req, res, next) => {
  const currentPage = req.body.pageNumber;
  const perPage = 10;
  try {
    const totalItems = await Mentor.find().countDocuments();
    const mentors = await Mentor.find()      
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

exports.updateMentor = async (req, res, next) => {
    const mentorId = req.params.mentorId;
    const errors = validationResult(req);
    
    const mentorImage = req.body.mentorImage.replace("\\" ,"/");
    const mentorUserName = req.body.mentorUserName;
    const mentorProfile = req.body.mentorProfile;    
    const mentorField = req.body.mentorField;
    const mentorEmail = req.body.mentorEmail;
        
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
    if(!req.body.mentorImage) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

        
    try {
        const user = await User.findById(req.userId);

        const mentor = await Mentor.findById(mentorId);
        
        mentor.mentorImage = mentorImage;
        mentor.mentorUserName = mentorUserName;
        mentor.mentorProfile = mentorProfile;        
        mentor.mentorField = mentorField;
        mentor.mentorEmail = mentorEmail;
                
        const result = await mentor.save();

        user.mentors.push(result);
        await user.save();

        res.status(201).json({
            message: 'Event updated',
            mentor: result            
        });
    } catch(err) {
        if(!err.statusCode) {
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

