const express = require('express');
const { body } = require('express-validator');

const aboutController = require('../controllers/about');
const router = express.Router();


// router.get('/:questionId', questionController.getQuestion);
// router.post('/edit-question', questionController.addQuestion);
// router.put('/update', aboutController.updateAbout);


module.exports = router;
