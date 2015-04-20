var express = require('express');
var auth = require('../utils/auth');
var router = express.Router();

var Profile = require('../models/profile');
var facebook = require('../providers/facebook');

router.use('/profile', auth.isLoggedIn);

router.get('/profile', function(req, res) {
	Profile.findOne({ 'userId': req.user._id }, function(err, profile){
		if(err)
			res.send(err);
		if (!profile) {
			profile = new Profile();
			profile.userId = req.user._id;
		}

		res.render('profile.ejs', {
		  user : req.user, // get the user out of session and pass to template
		  profile: profile
		});
	});
});

router.post('/profile', function(req, res) {
	Profile.findOne({ 'userId': req.user._id }, function(err, profile){
		if(err)
			res.send(err);
		if (!profile) {
			profile = new Profile();
			profile.userId = req.user._id;
		}

		if (req.body.name) {
			profile.name = req.body.name;
		}

		if (req.body.birthdate) {
			profile.birthdate = req.body.birthdate;
		}

		if (req.body.gender) {
			profile.gender = req.body.gender;
		}

		if (req.body.work_company) {
			profile.work = [{
				company: req.body.work_company,
				title: req.body.work_title,
				location: req.body.work_location,
				from: req.body.work_from,
				to: req.body.work_to,
				description: req.body.work_description
			}]; 
		}

		if (req.body.edu_school) {
			profile.education = [{
				school: req.body.edu_school,
				major: req.body.edu_major,
				from: req.body.edu_from,
				to: req.body.edu_to,
				description: req.body.edu_description
			}];
		}

		if (req.body.live_location) {
			profile.placesLived = [{
				location: req.body.live_location,
				from: req.body.live_from,
				to: req.body.live_to,
				description: req.body.live_description
			}];
		}

		if (req.body.language) {
			profile.languages = [{
				language: req.body.language
			}];
		}

		if (req.body.professionalSkill) {
			profile.professionalSkills = [{
				professionalSkill: req.body.professionalSkill
			}];
		}

		if (req.body.interest) {
			profile.interests = [{
				interest: req.body.interest
			}];
		}

		profile.save(function(err, profile){
			if(err)
				res.send(err);

			res.render('profile.ejs', {
				user : req.user,
				profile: profile
			});
		});
	});
});

router.get('/profile/facebook', function(req, res) {
	Profile.findOne({ 'userId': req.user._id }, function(err, profile){
		if(err)
			res.send(err);
		if (!profile) {
			profile = new Profile();
			profile.userId = req.user._id;
		}

		facebook.getData(req.user.facebook.token, '/' + req.user.facebook.id, function(data){
			fbProfile = JSON.parse(data);
		    if (fbProfile.gender) {
		    	profile.gender = fbProfile.gender == 'male' ? 'M' : 'F';	
		    }

		    if (fbProfile.name) {
		    	profile.name = fbProfile.name;	
		    }

		    if (fbProfile.birthday) {
		    	profile.birthdate = fbProfile.birthday;
		    }

		    if (fbProfile.education && fbProfile.education.length > 0) {
		    	profile.education = [{
		    		school: fbProfile.education[0].school.name,
		    		major: fbProfile.education[0].concentration === undefined || fbProfile.education[0].concentration.length === 0 
		    			? '' : fbProfile.education[0].concentration[0].name,
		    		from: fbProfile.education[0].year === undefined ? '' : fbProfile.education[0].year.name,
		    	}];
		    }

		    if (fbProfile.location) {
		    	profile.placesLived = [{
		    		location: fbProfile.location.name,
		    		to: 'Now'
		    	}];
		    }

		    if (fbProfile.work && fbProfile.work.length > 0) {
		    	profile.work = [{
		    		company: fbProfile.work[0].employer.name,
		    		title: fbProfile.work[0].position.name,
		    		location: fbProfile.work[0].location.name,
		    		from: fbProfile.work[0].start_date,
		    		to: fbProfile.work[0].end_date === undefined  ? 'Now' : fbProfile.work[0].end_date,
		    		description: fbProfile.work[0].description
		    	}];
		    }

		    profile.save(function(err, profile){
				if(err)
					res.send(err);

				res.redirect('/profile');
			});
		});
	});
});

module.exports = router;
