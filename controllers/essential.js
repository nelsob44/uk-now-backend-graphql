const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const { validationResult } = require('express-validator');

const Essential = require('../models/essential');
const Quiz = require('../models/quiz');
const User = require('../models/user');
const Result = require('../models/result');


exports.addEssential = async (req, res, next) => {
  console.log(req.body);
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

exports.addQuiz = async (req, res, next) => {
     
    const questionSubject = req.body.subject;    
    const questionImage = req.body.theImage.replace("\\" ,"/");
    const questionDetail = req.body.questionDetail;
    const questionAnswerFirst = req.body.questionAnswer.toLowerCase().replace(/\s/g, "");
        
    hashedQuestionAnswer = await bcrypt.hash(questionAnswerFirst, 12);
    
    const quiz = new Quiz({
        questionSubject: questionSubject,
        questionDetail: questionDetail,
        questionImage: questionImage, 
        questionAnswer: hashedQuestionAnswer,            
        creator: req.userId        
    });
    
    try {
        await quiz.save();
        
        res.status(201).json({
            message: 'Quiz added',
            quiz: quiz            
        });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.submitQuiz = async (req, res, next) => {     
  
  const tookQuizBefore = await Result.find({ userId: req.userId });
  // console.log(tookQuizBefore.length > 0);
  if(tookQuizBefore.length > 0) {
    return;
  }

  const formValues = Object.entries(req.body);
  
  const enteredAns = [];
  let rightAns = [];
  const hashedAnsArray = [];
  const countArray = [];

  const user = await User.findById(req.userId);

  
  try {
        await formValues.forEach(q => {
          if(q[0].indexOf('answer_') > -1) {
            
            enteredAns.push(q[1]);
          }

          if(q[0].indexOf('quizAnswer_') > -1) {
            
            rightAns.push(q[1]);
          }
        }); 

        await Promise.all(enteredAns.map(async (a) => {
          hashedAns = a.toLowerCase().replace(/\s/g, "");
          
          hashedAnsArray.push(hashedAns);

        }));
        
        for(let i=0; i < rightAns.length; i++) {
          for(let j=0; j < hashedAnsArray.length; j++) {
            if(i === j) {
              const isEqual = await bcrypt.compare(hashedAnsArray[j], rightAns[i]);
              if(isEqual) {
                countArray.push(hashedAnsArray[j]);
              }
            }
          }
        }

        const arrayLength = countArray.length;
        const rightAnsArrayLength = rightAns.length;
        const score = Math.round(arrayLength/rightAnsArrayLength * 100);
        
        const result = new Result({
          userName: user.firstname + ' ' + user.lastname,
          userId: req.userId,
          subject: formValues[2][1],
          score: score            
        });

        await result.save();
        
        res.status(200).json({
          message: 'Quiz successfully processed',
          score: score    
        });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
  }  
  
};


exports.getQuizResults = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 100;
      
  try {
    
    const totalItems = await Result.find().countDocuments();
    const results = await Result.find()      
      .sort({ createdAt: 1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    
    res.status(201).json({
      message: 'Fetched results successfully.',
      results: results,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getQuiz = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 20;
  
  const tookQuizBefore = await Result.find({ userId: req.userId }).countDocuments();
  
  if(tookQuizBefore > 0) {

    return;
  }
  try {
    const totalItems = await Quiz.find().countDocuments();
    const quizzes = await Quiz.find()      
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    
    res.status(200).json({
      message: 'Fetched quizzes successfully.',
      quizzes: quizzes,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
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

exports.deleteQuiz = async (req, res, next) => {
  const questionSubject = req.body.subject;
  
  try {    

    await Quiz.deleteMany({ questionSubject : questionSubject });

    await Result.deleteMany({ subject : questionSubject });
        
    res.status(200).json({ message: 'Quiz deleted' });
  } catch (err) {
    if (!err.statusCode) {
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


