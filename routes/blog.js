const express = require('express');
const { body } = require('express-validator');

const blogController = require('../controllers/blog');
const isAuth = require('../middleware/is-auth');

const router = express.Router();


// router.get('/show', aboutController.getAbout);
router.post('/list', blogController.getBlogs);
router.post('/add', isAuth, [
    body('blogTitle').isLength({min: 2}),
    body('blogDetails').isLength({min: 2}),
],
 blogController.addBlog);
router.post('/update/:blogId', isAuth, blogController.updateBlog);
router.put('/like/:blogId', isAuth, blogController.updateBlogLike);
router.put('/comment/:blogId', isAuth, blogController.addBlogComment);
router.post('/delete/:itemId', isAuth, blogController.deleteItem);
router.post('/:blogId', blogController.getBlog);


module.exports = router;
