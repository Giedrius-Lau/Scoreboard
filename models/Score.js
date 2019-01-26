const mongoose = require('mongoose');

const schema = {
	name: String,
	score: Number
};

module.exports = mongoose.model('Score', schema);
