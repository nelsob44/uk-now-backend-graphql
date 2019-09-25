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
// router.put('/update', aboutController.updateAbout);


module.exports = router;
