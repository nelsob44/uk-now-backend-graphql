const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Event = require('../models/event');
const User = require('../models/user');


exports.addEvent = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
    if(!req.body.eventImage) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const user = await User.findById(req.userId);
    
    const eventName = req.body.eventName;
    const eventDetails = req.body.eventDetails;
    const eventLocation = req.body.eventLocation;
    const eventDate = req.body.eventDate;
    const eventImage = req.body.eventImage.replace("\\" ,"/");
    const creator = req.userId;
    

    const event = new Event({
        eventName: eventName,
        eventDetails: eventDetails,
        eventLocation: eventLocation,
        eventDate: eventDate,
        eventImage: eventImage,
        creator: creator        
    });
    
    try {
        await event.save();

        user.events.push(event);
        await user.save();

        res.status(201).json({
            message: 'Event created',
            event: event            
        });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getEvents = async (req, res, next) => {
  const currentPage = req.body.pageNumber || 1;
  const perPage = 10;
  try {
    const totalItems = await Event.find().countDocuments();
    const events = await Event.find()      
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    
    res.status(200).json({
      message: 'Fetched events successfully.',
      events: events,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateEvent = async (req, res, next) => {
    const eventId = req.params.eventId;
    const errors = validationResult(req);
    
    const eventImage = req.body.eventImage.replace("\\" ,"/");
    const eventName = req.body.eventName;
    const eventDetails = req.body.eventDetails;    
    const eventLocation = req.body.eventLocation;
    const eventDate = req.body.eventDate;
        
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
    if(!req.body.eventImage) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

        
    try {
        const user = await User.findById(req.userId);

        const event = await Event.findById(eventId);
        
        event.eventImage = eventImage;
        event.eventName = eventName;
        event.eventDetails = eventDetails;        
        event.eventLocation = eventLocation;
        event.eventDate = eventDate;
                
        const result = await event.save();

        user.events.push(result);
        await user.save();

        res.status(201).json({
            message: 'Event updated',
            event: result            
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
    
  event = await Event.findById(itemId);
  
  try {
    

    if (!event) {
      const error = new Error('Could not find item to delete.');
      error.statusCode = 404;
      throw error;
    }

    clearImage(event.eventImage);
    
    const user = await User.findById(req.userId);
        
    user.blogs.pull(itemId);
    await user.save();
    
    await Event.deleteOne({_id: itemId});    

    // io.getIO().emit('posts', { action: 'delete', post: postId });
    res.status(200).json({ message: 'Event Deleted.' });
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
