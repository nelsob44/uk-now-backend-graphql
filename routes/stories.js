const express = require('express');
const { body } = require('express-validator');

const storyController = require('../controllers/stories');
const isAuth = require('../middleware/is-auth');

const router = express.Router();


// router.get('/show', aboutController.getAbout);
router.post('/list', isAuth, storyController.getStories);
router.post('/add', isAuth, [
    body('storyTitle').isLength({min: 2}),
    body('storyDetails').isLength({min: 2}),
],
 storyController.addStory);
router.put('/like/:storyId', isAuth, storyController.updateStoryLike);
router.post('/update/:storyId', isAuth, [
    body('storyTitle').isLength({min: 2}),
    body('storyDetails').isLength({min: 2}),
], storyController.updateStory);
router.post('/delete/:itemId', isAuth, storyController.deleteItem);
router.post('/:storyId', isAuth, storyController.getStory);


module.exports = router;
