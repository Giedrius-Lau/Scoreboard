const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { connectionString } = require('../config');

const options = {
	autoReconnect: true,
	reconnectTries: Number.MAX_VALUE,
	useNewUrlParser: true,
};

mongoose.connect(
	connectionString,
	options
);

console.log('MongoDB connected successfully');

module.exports = mongoose;
