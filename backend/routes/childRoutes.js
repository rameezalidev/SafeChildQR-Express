const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const parents = require('../models/parents.json');
const authenticate = require('../utils/auth');
const {addChildren, getChildren, getSingleChildren, deleteChildren, updateChild} = require('../controllers/children');

router.post('/children',authenticate,addChildren);
router.get('/children',authenticate,getChildren);
router.get('/children/:id',authenticate,getSingleChildren);
router.delete('/children/:id',authenticate,deleteChildren);
router.put('/children/:id',authenticate,updateChild);

module.exports = router;