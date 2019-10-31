const express = require('express');
const { body } = require('express-validator');

const essentialController = require('../controllers/essential');
const isAuth = require('../middleware/is-auth');

const router = express.Router();


// router.get('/show', aboutController.getAbout);
router.post('/list', isAuth, essentialController.getEssentials);
router.post('/add', isAuth, [
    body('essentialDetails').isLength({min: 2})    
],
 essentialController.addEssential);
router.post('/update/:essentialId', isAuth, [
    body('essentialDetails').isLength({min: 2})    
],
 essentialController.updateEssential);
router.post('/delete/:itemId', isAuth, essentialController.deleteItem);
router.post('/delete-quiz', isAuth, essentialController.deleteQuiz);
router.post('/quiz', isAuth, essentialController.addQuiz);
router.post('/quiz-submit', isAuth, essentialController.submitQuiz);
router.post('/get-quiz', isAuth, essentialController.getQuiz);
router.post('/get-quiz-results', isAuth, essentialController.getQuizResults);


module.exports = router;
