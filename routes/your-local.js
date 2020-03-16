const express = require('express');
const { body } = require('express-validator');

const localController = require('../controllers/local');
const isAuth = require('../middleware/is-auth');

const router = express.Router();


// router.get('/show', localController.getAbout);
router.post('/list', isAuth, localController.getLocals);
router.post('/list-filter', isAuth, localController.getLocalsFilter);
router.post('/add', isAuth, [
    body('localName').isLength({min: 2}),
    body('localType').isLength({min: 2}),
    body('localAddress').isLength({min: 2}),
    body('localContact').isLength({min: 2})
],
 localController.addLocal);
router.post('/update/:localId', isAuth, [
    body('localName').isLength({min: 2}),
    body('localType').isLength({min: 2}),
    body('localAddress').isLength({min: 2}),
    body('localContact').isLength({min: 2})
],
 localController.updateLocal);
router.put('/rating/:localId', isAuth, localController.updateRating);
router.post('/delete/:itemId', isAuth, localController.deleteItem);
// router.put('/update', localController.updateAbout);


module.exports = router;
