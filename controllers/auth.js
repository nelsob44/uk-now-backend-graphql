const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
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

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    let loadedUser;
    try {
        const user = await User.findOne({ email: email });
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
            { expiresIn: 60 * 60 }
        );
        res.status(200).json({             
            userId: loadedUser._id.toString(),
            firstname: loadedUser.firstname,
            lastname: loadedUser.lastname,
            status: loadedUser.status,
            token: token
        });
    } catch (err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};