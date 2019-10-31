const fs = require('fs');
const path = require('path');

const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.SENDGRID_KEY
    }
}));

const { validationResult } = require('express-validator');


exports.sendEmail = async (req, res, next) => {
    const errors = validationResult(req);
        
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
        
    const senderName = req.body.senderName;
    const senderEmail = req.body.senderEmail;
    const messageDetail = req.body.messageDetail;
     
    try {

       await transporter.sendMail({
            to: 'admin@myglowstar.com',
            from: senderEmail,
            subject: senderName +': UK Now user enquiry',
            html: messageDetail
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