const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const About = require('../models/about');
const User = require('../models/user');


exports.getAbout = async (req, res, next) => {

    const about = await About.find()
    try {
        if (!about) {
            const error = new Error('Sorry, could not fetch the page at the moment');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: 'Page fetched',
            about: about
        })
    }catch (err) {
        if(!err.statusCode) {
            err.statusCode = 500
        }

        next(err);
    }
};

exports.addAbout = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
    if(!req.body.aboutImage) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }
    
    const aboutImage = req.body.aboutImage.replace("\\" ,"/");
    const aboutDetails = req.body.aboutDetails;

    const about = new About({
        aboutImage: aboutImage,
        aboutDetails: aboutDetails,
        creator: req.userId
    });
    try {
        await about.save();

        res.status(201).json({
            message: 'About info created',
            about: about            
        });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};