const express = require('express');
const { body } = require('express-validator');

const mentorController = require('../controllers/mentor');
const isAuth = require('../middleware/is-auth');

const router = express.Router();


// router.get('/show', aboutController.getAbout);
router.post('/list', isAuth, mentorController.getMentors);
router.post('/add', isAuth, [
    body('mentorUserName').isLength({min: 2}),
    body('mentorProfile').isLength({min: 2}),
    body('mentorField').isLength({min: 2}),
    body('mentorEmail').isEmail(),
],
 mentorController.addMentor);

router.post('/update/:mentorId', isAuth, [
    body('mentorUserName').isLength({min: 2}),
    body('mentorProfile').isLength({min: 2}),
    body('mentorField').isLength({min: 2}),
    body('mentorEmail').isEmail(),
],
 mentorController.updateMentor);
router.post('/delete/:itemId', isAuth, mentorController.deleteItem);
router.post('/:mentorId', isAuth, mentorController.getMentor);


module.exports = router;
