const express = require('express');
const { body } = require('express-validator');

const messageController = require('../controllers/message');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.post('/add', isAuth, [
    body('messageFrom').isLength({min: 1}),
    body('messageTo').isLength({min: 1})
],
 messageController.addMessage);

router.post('/read', isAuth, messageController.getMessages);
router.post('/get-unread', isAuth, messageController.getMessagesFilter);
router.post('/read-update', isAuth, messageController.updateReadMessages);
router.post('/delete/:userId', isAuth, messageController.deleteItem);


module.exports = router;
