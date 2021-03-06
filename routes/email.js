const express = require('express');
const { body } = require('express-validator');

const emailController = require('../controllers/email');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.post('/resend', isAuth, emailController.reSendEmail);

router.post('/send', isAuth, [
    body('senderName').isLength({min: 2}),
    body('senderEmail')
    .isEmail()
    .normalizeEmail(),
    body('messageDetail').isLength({min: 5})
],
 emailController.sendEmailToAdmin);

router.post('/verify-email', emailController.sendEmailVerification);

module.exports = router;
