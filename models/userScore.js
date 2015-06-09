var mongoose = require('mongoose');

var userScoreSchema = mongoose.Schema({
	userId : String,
	segId : String,
	targetUserId : String,
	score : Number
}, { collection : 'userScores' });

module.exports = mongoose.model('UserScore', userScoreSchema);



