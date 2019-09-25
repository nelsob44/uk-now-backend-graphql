const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Question = require('../models/question');
const Comment = require('../models/comment');
const User = require('../models/user');


exports.addQuestion = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
        
    const user = await User.findById(req.userId);
        
    const questionTitle = req.body.questionTitle;
    const questionDetails = req.body.questionDetails;
    const questionTime = new Date().getTime();
    

    const question = new Question({
        questionTitle: questionTitle,
        questionDetails: questionDetails,
        questionTime: questionTime,
        questionReplies: [], 
        questionUserName: user.firstname + ' ' + user.lastname,
        questionUser: req.userId
    });
    
    try {
        await question.save();

        user.questions.push(question);
        await user.save();

        res.status(201).json({
            message: 'Question created',
            question: question            
        });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getQuestions = async (req, res, next) => {
  const currentPage = req.body.pageNumber;
  const perPage = 10;
  try {
    const totalItems = await Question.find().countDocuments();
    const questions = await Question.find()      
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    
    res.status(200).json({
      message: 'Fetched questions successfully.',
      questions: questions,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addQuestionComment = async (req, res, next) => {
    const questionId = req.params.questionId;
    const errors = validationResult(req);    
    const type = req.body.type;  
    const date = req.body.date;  
    const questionComment = req.body.commentDetails;
           
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
            
    try {
        const user = await User.findById(req.userId);

        const username = user.firstname + ' ' + user.lastname;
        const creator = req.userId;

        const question = await Question.findById(questionId);

        const comment = new Comment({
            commentDetails: questionComment,
            type: type,
            blogDate: date,
            userName: username,
            creator: creator
        });
                       
                               
        const result = await comment.save();

        await question.questionReplies.push(result);

        await Comment.deleteOne({_id: result._id});
        
        newQuestion = await question.save();

        res.status(201).json({
            question: newQuestion            
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
    
  question = await Question.findById(itemId);
  
  try {
    

    if (!question) {
      const error = new Error('Could not find item to delete.');
      error.statusCode = 404;
      throw error;
    }
    const user = await User.findById(req.userId);
    replies = question.questionReplies;
    
    comments = await Comment.find();

    for(let i; i < replies.length; i++)
    {
        Comment.deleteOne(false, {_id: replies[i]._id}); 
    }
        
    
    user.questions.pull(itemId);
    await user.save();
    
    await Question.deleteOne({_id: itemId});    

    // io.getIO().emit('posts', { action: 'delete', post: postId });
    res.status(200).json({ message: 'Deleted Question.' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

