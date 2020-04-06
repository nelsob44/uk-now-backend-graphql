const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        console.log(req.body);
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const password = req.body.password;

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: hashedPassword
        });

        const result = await user.save();
        res.status(201).json({ message: 'New user created!', userId: result._id });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateProfile = async (req, res, next) => {
        
    const userId = req.body.userId;
    const password = req.body.password;
    const details = req.body.details;
    const profilePic = req.body.profilePic;

    const user = await User.findById(userId); 
    const totalUsers = await User.countDocuments();
    const hashedPassword = await bcrypt.hash(password, 12);
        
    if(password === 'null' || password === '') {        
        user.password = user.password;
    } else {
        user.password = hashedPassword;
    }
    if(details === 'null' || details === '') {        
        user.details = user.details;
    } else {
        user.details = details;
    }
    if(profilePic.length > 30) {        
        user.profilePic = profilePic;
    } 

    try {         

        const loadedUser = await user.save();
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            'builtinseptember',
            { expiresIn: '2h' }
        );
        res.status(200).json({
            userId: loadedUser._id.toString(),
            firstname: loadedUser.firstname,
            lastname: loadedUser.lastname,
            status: loadedUser.status,            
            token: token,
            totalUsers: totalUsers,
            details: loadedUser.details,
            email: loadedUser.email,
            profilePic: loadedUser.profilePic
        });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    let loadedUser;
    try {
        const user = await User.findOne({ email: email });
        const totalUsers = await User.countDocuments();
        if(!user) {
            const error = new Error('User with this email could not be found');
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);

        if(!isEqual) {
            const error = new Error('Wrong password entered!');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            'builtinseptember',
            { expiresIn: '2h' }
        );
        res.status(200).json({
            userId: loadedUser._id.toString(),
            firstname: loadedUser.firstname,
            lastname: loadedUser.lastname,
            status: loadedUser.status,            
            token: token,
            totalUsers: totalUsers,
            details: loadedUser.details,
            email: loadedUser.email,
            profilePic: loadedUser.profilePic
        });
    } catch (err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getProfile = async (req, res, next) => {
    const userId = req.body.userId;
    
    let loadedUser;
    try {
        const user = await User.findById(userId);
        
        if(!user) {
            const error = new Error('User with this userId could not be found');
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        
        res.status(200).json({
            userId: loadedUser._id.toString(),
            firstname: loadedUser.firstname,
            lastname: loadedUser.lastname,
            status: loadedUser.status,            
            token: '',
            totalUsers: 0,
            details: loadedUser.details,
            email: loadedUser.email,
            profilePic: loadedUser.profilePic
        });
    } catch (err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

