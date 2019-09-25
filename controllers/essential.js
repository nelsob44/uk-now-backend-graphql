const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Essential = require('../models/essential');
const User = require('../models/user');


exports.addEssential = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
    if(!req.body.essentialsImage) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const user = await User.findById(req.userId);
    
    const essentialDetails = req.body.essentialDetails;    
    const essentialsImage = req.body.essentialsImage.replace("\\" ,"/");
    const essentialsTime = req.body.essentialsTime;
    

    const essential = new Essential({
        essentialDetails: essentialDetails,
        essentialsImage: essentialsImage,
        essentialsTime: essentialsTime,             
        creator: req.userId        
    });
    
    try {
        await essential.save();

        user.essentials.push(essential);
        await user.save();

        res.status(201).json({
            message: 'Essential created',
            essential: essential            
        });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getEssentials = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 10;
  try {
    const totalItems = await Essential.find().countDocuments();
    const essentials = await Essential.find()      
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    
    res.status(200).json({
      message: 'Fetched essentials successfully.',
      essentials: essentials,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateEssential = async (req, res, next) => {
    const essentialId = req.params.essentialId;
    const errors = validationResult(req);
    
    const essentialsImage = req.body.essentialsImage.replace("\\" ,"/");
    const essentialDetails = req.body.essentialDetails;
    const essentialsTime = req.body.essentialsTime;    
            
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
    if(!req.body.essentialsImage) {        
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

        
    try {
        const user = await User.findById(req.userId);

        const essential = await Essential.findById(essentialId);
        
        essential.essentialsImage = essentialsImage;
        essential.essentialDetails = essentialDetails;
        essential.essentialsTime = essentialsTime;        
                                
        const result = await essential.save();

        user.essentials.push(result);
        await user.save();

        res.status(201).json({
            message: 'Essential updated',
            essential: result            
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
    
  essential = await Essential.findById(itemId);
  
  try {    

    if (!essential) {
      const error = new Error('Could not find item to delete.');
      error.statusCode = 404;
      throw error;
    }

    clearImage(essential.essentialsImage);
    
    const user = await User.findById(req.userId);
        
    user.essentials.pull(itemId);
    await user.save();
    
    await Essential.deleteOne({_id: itemId});    

    // io.getIO().emit('posts', { action: 'delete', post: postId });
    res.status(200).json({ message: 'Essential deleted' });
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


