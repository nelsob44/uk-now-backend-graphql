const express = require('express');
const { body } = require('express-validator');

const questionController = require('../controllers/question');
const isAuth = require('../middleware/is-auth');
const router = express.Router();


// router.get('/:questionId', questionController.getQuestion);
router.post('/list', isAuth, questionController.getQuestions);
router.post('/add', isAuth, [
    body('questionTitle').isLength({min: 2}),
    body('questionDetails').isLength({min: 2})
], questionController.addQuestion);
router.put('/comment/:questionId', isAuth, questionController.addQuestionComment);
router.post('/delete/:itemId', isAuth, questionController.deleteItem);



module.exports = router;
