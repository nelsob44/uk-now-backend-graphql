const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Blog = require('../models/blog');
const Comment = require('../models/comment');

const User = require('../models/user');


exports.addBlog = async (req, res, next) => {
    const errors = validationResult(req);
        
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
    if(!req.body.blogImage) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const user = await User.findById(req.userId);
    
    const blogImage = req.body.blogImage.replace("\\" ,"/");
    const blogTitle = req.body.blogTitle;
    const blogDetails = req.body.blogDetails;
    const blogDate = new Date().getTime();
    const blogLikes = 0;
    const blogFirstName = user.firstname;
    const blogLastName = user.lastname;
    const blogNumberOfComments = 0;

    const blog = new Blog({
        blogTitle: blogTitle,
        blogDetails: blogDetails,
        blogImage: blogImage,
        blogFirstName: blogFirstName,
        blogLastName: blogLastName,
        blogDate: blogDate,
        blogLikes: blogLikes,
        blogComments: [],
        blogNumberOfComments: blogNumberOfComments,
        creator: req.userId
    });
    
    try {
        await blog.save();

        user.blogs.push(blog);
        await user.save();

        res.status(201).json({
            message: 'Blog created',
            blog: blog            
        });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateBlog = async (req, res, next) => {
    const blogId = req.params.blogId;
    const errors = validationResult(req);
    
    const blogImage = req.body.blogImage.replace("\\" ,"/");
    const blogTitle = req.body.blogTitle;
    const blogDetails = req.body.blogDetails;    
    const blogLikes = req.body.blogLikes;
        
    const blogNumberOfComments = req.body.blogNumberOfComments;
    
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
    if(!req.body.blogImage) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

        
    try {
        const user = await User.findById(req.userId);

        const blog = await Blog.findById(blogId).populate('creator');
        
        blog.blogImage = blogImage;
        blog.blogTitle = req.body.blogTitle;
        blog.blogDetails = blogDetails;        
        blog.blogLikes = blogLikes;
        blog.blogNumberOfComments = blogNumberOfComments;
                
        const result = await blog.save();

        user.blogs.push(result);
        await user.save();

        res.status(201).json({
            message: 'Blog updated',
            blog: result            
        });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateBlogLike = async (req, res, next) => {
    const blogId = req.params.blogId;
    const errors = validationResult(req);    
      
    const blogLikes = req.body.blogLikes;
    
        
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
    
        
    try {
        const user = await User.findById(req.userId);

        const blog = await Blog.findById(blogId).populate('creator');

        const likedBefore = await blog.blogLikers.indexOf(req.userId);
        if(likedBefore > -1) {
            return;
        }
                       
        blog.blogLikes = blogLikes;
        blog.blogLikers.push(req.userId);
                       
        const result = await blog.save();

        user.blogs.push(result);
        await user.save();

        res.status(201).json({
            blog: result            
        });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.addBlogComment = async (req, res, next) => {
    const blogId = req.params.blogId;
    const errors = validationResult(req);    
    const type = req.body.type;  
    const date = req.body.date;  
    const blogComment = req.body.commentDetails;
           
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, ensure entered data is correct');
        error.statusCode = 422;
        throw error;
    }
            
    try {
        const user = await User.findById(req.userId);

        const username = user.firstname + ' ' + user.lastname;
        const creator = req.userId;

        const blog = await Blog.findById(blogId).populate('creator');

        const comment = new Comment({
            commentDetails: blogComment,
            type: type,
            blogDate: date,
            userName: username,
            creator: creator
        });
                       
                               
        const result = await comment.save();

        blog.blogComments.push(result);
        
        newBlog = await blog.save();

        res.status(201).json({
            blog: newBlog            
        });
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.getBlogs = async (req, res, next) => {
  const currentPage = req.body.pageNumber;
  const perPage = 10;
  
  console.log(currentPage);
  
  try {
    const totalItems = await Blog.find().countDocuments();
    const blogs = await Blog.find()      
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
          
    res.status(200).json({
      message: 'Fetched blogs successfully.',
      blogs: blogs,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteItem = async (req, res, next) => {
  const itemId = req.params.itemId;
    
  blog = await Blog.findById(itemId);
  
  try {
    

    if (!blog) {
      const error = new Error('Could not find item to delete.');
      error.statusCode = 404;
      throw error;
    }

    clearImage(blog.blogImage);
    
    const user = await User.findById(req.userId);
    replies = blog.blogComments;
    
    comments = await Comment.find();

    for(let i; i < replies.length; i++)
    {
        Comment.deleteOne(false, {_id: replies[i]._id}); 
    }        
    
    user.blogs.pull(itemId);
    await user.save();
    
    await Blog.deleteOne({_id: itemId});    

    // io.getIO().emit('posts', { action: 'delete', post: postId });
    res.status(200).json({ message: 'Deleted Blog.' });
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


