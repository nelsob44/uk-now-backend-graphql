const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Local = require('../models/local');
const User = require('../models/user');


exports.addLocal = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
    if(!req.body.localImage) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const user = await User.findById(req.userId);
    
    const localName = req.body.localName;
    const localType = req.body.localType;
    const localImage = req.body.localImage.replace("\\" ,"/");
    const localAddress = req.body.localAddress;
    const localContact = req.body.localContact;
    const localRating = req.body.localRating;
    const creator = req.userId;
    

    const local = new Local({
        localName: localName,
        localType: localType,
        localAddress: localAddress,
        localImage: localImage,
        localContact: localContact,
        localRating: localRating,
        creator: creator        
    });
    
    try {
        await local.save();

        user.locals.push(local);
        await user.save();

        res.status(201).json({
            message: 'Your-Local created',
            local: local            
        });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getLocals = async (req, res, next) => {
  const currentPage = req.body.pageNumber || 1;
  const perPage = 10;
  try {
    const totalItems = await Local.find().countDocuments();
    const locals = await Local.find()      
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    
    res.status(200).json({
      message: 'Fetched locals successfully.',
      locals: locals,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateLocal = async (req, res, next) => {
    const localId = req.params.localId;
    const errors = validationResult(req);
    
    const localImage = req.body.localImage.replace("\\" ,"/");
    const localName = req.body.localName;
    const localType = req.body.localType; 
    const localAddress = req.body.localAddress; 
    const localContact = req.body.localContact; 
    const localRating = req.body.localRating;    
            
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
    if(!req.body.localImage) {        
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

        
    try {
        const user = await User.findById(req.userId);

        const local = await Local.findById(localId);
        
        local.localName = localName;
        local.localType = localType;
        local.localAddress = localAddress; 
        local.localImage = localImage;
        local.localContact = localContact;
        local.localRating = localRating;       
                                
        const result = await local.save();

        user.locals.push(result);
        await user.save();

        res.status(201).json({
            message: 'Your Locals updated',
            local: result            
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
    
  local = await Local.findById(itemId);

  try {
    

    if (!local) {
      const error = new Error('Could not find item to delete.');
      error.statusCode = 404;
      throw error;
    }
        
    clearImage(local.localImage);
    await Local.findByIdAndRemove(itemId);

    const user = await User.findById(req.userId);
    user.locals.pull(itemId);
    await user.save();

    // io.getIO().emit('posts', { action: 'delete', post: postId });
    // res.status(200).json({ message: 'Deleted post.' });
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

