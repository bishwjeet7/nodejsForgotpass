const express = require('express');
const router = express.Router();
const {registerUser, loginUser, forgotPassword, resetPassword} = require('../controller/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword/', resetPassword);


module.exports = router;