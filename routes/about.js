const express = require('express');
const { body } = require('express-validator');

const aboutController = require('../controllers/about');
const isAuth = require('../middleware/is-auth');

const router = express.Router();


router.get('/show', aboutController.getAbout);
router.post('/add', isAuth, [
    body('aboutDetails').isLength({min: 5})
],
 aboutController.addAbout);
// router.put('/update', aboutController.updateAbout);


module.exports = router;
