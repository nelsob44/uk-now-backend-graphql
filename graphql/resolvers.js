const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const About = require('../models/about');
const Blog = require('../models/blog');
const Comment = require('../models/comment');
const Essential = require('../models/essential');
const Event = require('../models/event');
const Local = require('../models/local');
const Mentor = require('../models/mentor');
const Question = require('../models/question');
const Story = require('../models/story');


module.exports = {
    createUser: async function({ userInput }, req) {
    const user = new User({
      email: userInput.email,
      firstname: userInput.firstname, 
      lastname: userInput.lastname,     
      password: userInput.password
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };

  },

    tourism() {
        return {
            city: "Newcastle",
            date: '2019-10-13 12:23',
            title: 'City of lights',
            likes: 42
        }
    }
}