const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_KEY, domain: process.env.DOMAIN, host: process.env.HOST});

const { validationResult } = require('express-validator');
const User = require('../models/user');

exports.sendEmailToAdmin = async (req, res, next) => {
    const errors = validationResult(req);
        
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
    //    
    const senderName = req.body.senderName;
    const senderEmail = req.body.senderEmail;
    const messageDetail = req.body.messageDetail;
    const html = `<p> ${messageDetail} </p> <br> ${senderName}`;
     
    try {

        let data = {
        from: senderEmail,
        to: 'nelsondanbusiness@gmail.com',
        subject: 'Customer Enquiry',
        html: html
        };
        
        mailgun.messages().send(data, function (error, body) {
            if(error) {
                console.log(error);
            } else {
                console.log(body);
            }    
        });
               
        res.status(201).json({
            message: 'Email sent',
                  
        });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.sendEmailVerification = async (req, res, next) => {
    const errors = validationResult(req);
        
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
    //    
    const email = req.body.email;
    const token = req.body.token;    
     
    try {
        const user = await User.findOne({ email: email, token: token });
    
        if(user) {
            user.verified = true;

            await user.save();
            res.status(201).json({
                message: 'Your email has been verified'                    
            });
        } else {
            res.status(201).json({
                message: 'Sorry, your email could not be verified.'                    
            });
        }               
        
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.reSendEmail = async (req, res, next) => {
    const errors = validationResult(req);
        
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
    //    
    const email = req.body.email;
         
    try {
        const tokenString = await bcrypt.hash(email, 12);
                
        const frontUrl = await process.env.FRONT_URL;
        const urlencode1 = await tokenString.replace(/\//g, "a");
        const urlencode = await urlencode1.replace(/\\/g, "a");
                
        const url = frontUrl + '/verify-email/' + email + '/' + urlencode;
        const html = `<p>You have received this email because you signed up on UK Now. Click or copy and paste the link below into your browser to verify your email <br><br>
            ${url} </p> <br> The UK Now Team`;

        let data = {
            from: 'no-reply@uknow.com',
            to: email,
            subject: 'Verify your email',
            html: html
        };
        
        mailgun.messages().send(data, function (error, body) {
            if(error) {
                console.log(error);
            } else {
                console.log(body);
            }    
        });
               
        res.status(201).json({
            message: 'Verification Email has been sent to your email address.'                  
        });             
        
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};


