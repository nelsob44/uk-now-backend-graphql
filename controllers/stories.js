const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Story = require('../models/story');
const User = require('../models/user');


exports.addStory = async (req, res, next) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
    if(!req.body.storyImage) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const user = await User.findById(req.userId);
    
    const storyTitle = req.body.storyTitle;
    const storyDetail = req.body.storyDetails;
    const storyImage = req.body.storyImage.replace("\\" ,"/");
    const userName = user.firstname + ' ' + user.lastname;
    const postedOn = req.body.postedOn;
    const storyLikes = req.body.storyLikes;
    const creator = req.userId;
    

    const story = new Story({
        storyTitle: storyTitle,
        storyDetail: storyDetail,
        storyImage: storyImage,
        userName: userName,
        postedOn: postedOn,
        storyLikes: storyLikes,
        storyLikers: [],
        creator: creator        
    });
    
    try {
        await story.save();

        user.stories.push(story);
        await user.save();

        res.status(201).json({
            message: 'Story created',
            story: story            
        });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getStories = async (req, res, next) => {
  const currentPage = req.body.pageNumber;
  const perPage = 10;
  try {
    const totalItems = await Story.find().countDocuments();
    const stories = await Story.find()      
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    
    res.status(200).json({
      message: 'Fetched stories successfully.',
      stories: stories,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateStoryLike = async (req, res, next) => {
    const storyId = req.params.storyId;
    const errors = validationResult(req);    
      
    const storyLikes = req.body.storyLikes;
    
        
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
        
    try {
        const user = await User.findById(req.userId);

        const story = await Story.findById(storyId);

        const likedBefore = await story.storyLikers.indexOf(req.userId);
        if(likedBefore > -1) {
            return;
        }
                       
        story.storyLikes = storyLikes;
        story.storyLikers.push(req.userId);
                       
        const result = await story.save();

        user.stories.push(result);
        await user.save();

        res.status(201).json({
            story: result            
        });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateStory = async (req, res, next) => {
    const storyId = req.params.storyId;
    const errors = validationResult(req);
    
    const storyImage = req.body.storyImage.replace("\\" ,"/");
    const storyTitle = req.body.storyTitle;
    const storyDetail = req.body.storyDetails;    
    
    
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
    if(!req.body.storyImage) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

        
    try {
        const user = await User.findById(req.userId);

        const story = await Story.findById(storyId);
        
        story.storyImage = storyImage;
        story.storyTitle = req.body.storyTitle;
        story.storyDetail = storyDetail;        
        
                
        const result = await story.save();

        user.stories.push(result);
        await user.save();

        res.status(201).json({
            message: 'Story updated',
            story: result            
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
    
  story = await Story.findById(itemId);
  
  try {    

    if (!story) {
      const error = new Error('Could not find item to delete.');
      error.statusCode = 404;
      throw error;
    }

    clearImage(story.storyImage);
    
    const user = await User.findById(req.userId);
        
    user.stories.pull(itemId);
    await user.save();
    
    await Story.deleteOne({_id: itemId});    

    // io.getIO().emit('posts', { action: 'delete', post: postId });
    res.status(200).json({ message: 'Story deleted' });
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


