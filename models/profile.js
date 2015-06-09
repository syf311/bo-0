var mongoose = require('mongoose');

var profileSchema = mongoose.Schema({
	userId : String,
    birthdate: Date,
    gender: String,

	work: [{
	    company: String,
		title: String,
		location: String,
		from: String,
		to: String,
		description: String
	}],

    education: [{
    	school: String,
    	major: String,
    	from: String,
    	to: String,
    	description: String
    }],

    placesLived: [{
    	location: String,
    	from: String,
    	to: String,
    	description: String
    }],

    languages: [{
    	language: String,
    }],

    professionalSkills: [{
    	professionalSkill : String,
    }],

    interests: [{
    	interest: String
    }]
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Profile', profileSchema);
