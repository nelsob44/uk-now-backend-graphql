const express = require('express');
const { body, validationResult } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

router.post('/signup', [
    body('firstname')
    .trim()
    .not()
    .isEmpty(),
    body('lastname')
    .trim()
    .not()
    .isEmpty(),
    body('email')
    .isEmail()
    
    .custom((value, {req}) => {
        return User.findOne({email: value}).then(userDoc => {
            if(userDoc) {
                return Promise.reject('E-mail address already exists');
            }
        });
    })
    .normalizeEmail(),
    body('password')
    .trim()
    .isLength({min: 5})    
],
authController.signup 
);

router.post('/login', authController.login);
// router.post('/delete/:itemId', authController.deleteItem);

module.exports = router;