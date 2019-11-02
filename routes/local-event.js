const express = require('express');
const { body } = require('express-validator');

const eventController = require('../controllers/event');
const isAuth = require('../middleware/is-auth');

const router = express.Router();


// router.get('/show', aboutController.getAbout);
router.post('/list', eventController.getEvents);
router.post('/add', isAuth, [
    body('eventName').isLength({min: 2}),
    body('eventDetails').isLength({min: 2}),
    body('eventLocation').isLength({min: 2}),
],
 eventController.addEvent);
router.post('/update/:eventId', isAuth, [
    body('eventName').isLength({min: 2}),
    body('eventDetails').isLength({min: 2}),
    body('eventLocation').isLength({min: 2}),
], eventController.updateEvent);

router.post('/delete/:itemId', isAuth, eventController.deleteItem);
router.post('/:eventId', eventController.getEvent);


module.exports = router;
