'use strict';

const mongooseConnection = require('../../bin/mongo-connect').connection;

const router = require('express').Router();


router.use('/score', require('./score'));

module.exports = router;
