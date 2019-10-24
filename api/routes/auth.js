const express = require('express');
const router = express.Router();

const {signup, signin, verifyToken, signout} = require('../controllers/auth');
const {signupValidator} = require('../helpers/auth');

router.post('/signup', signupValidator, signup);
router.post('/signin', signin);
router.get('/signout', signout);

module.exports = router;