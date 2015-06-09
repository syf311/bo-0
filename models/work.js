var mongoose = require('mongoose');

var workSchema = mongoose.Schema({
	userId : String,

	work: [{
	    employerName: String,
		title: String,
		location: String,
		from: Date,
		to: Date,
		description: String
	}]
});

module.exports = mongoose.model('Work', workSchema);
