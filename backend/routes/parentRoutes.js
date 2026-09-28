const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { signUp } = require('../controllers/signUp');
const { login } = require('../controllers/login');
const parents = require('../models/parents.json');
const authenticate = require('../utils/auth')
router.post('/signup',
    body("email").isEmail().withMessage("Invlaid Email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be 6 characters")
    , signUp);

router.post('/login',
    body("email").isEmail().withMessage("Invlaid Email"),
    login);

router.get('/parents',authenticate, (req,res)=>{
    res.send(req.user);
})
module.exports = router;