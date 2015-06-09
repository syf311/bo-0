var auth = require('./auth');
var authConfig = require('../config/auth');
var endpointConfig = require('../config/endpoint');
var request = require('request');

workUtil = {
	populateWork: function (req, res, next) {
		if (res.statusCode && res.statusCode === 200) {
			request.get({ baseUrl: endpointConfig.profile.baseUrl, url: 'work', qs: null, json: true }, function(err, response, work) {
	  	  if (response.statusCode === 204) {
	  	    var work = {
	  	    	userId: req.user._id,
	  	    	work: workUtil[req.provider](req.profile)
	  	    };

	  	    request.post({ baseUrl: endpointConfig.profile.baseUrl, url: 'work', body: work, json: true }, function(err, response, body) {

	  	    	if (response.statusCode !== 200) {
	  	    		res.status(500).send({ message: body.error.message });
	  	    	} 

	  	    	next();
	  	  	}).auth(null, null, true, auth.createToken(req.user));
	  		} else if (response.statusCode !== 200) {

	  			return res.status(500).send({ message: work.error.message });
	  		} else {
	  			next();
	  		}
			}).auth(null, null, true, auth.createToken(req.user));
		}
  },

  fromFacebook: function (worksFromProvider) {
  	works = undefined;
  	if (worksFromProvider) {
  		works = [];
      for (var i in worksFromProvider) {
      	work = worksFromProvider[i];
      	
        works.push({
          employerName: work.employer.name,
          title: work.position.name,
          location: work.location.name,
          from: work.start_date,
          to: work.end_date = work.end_date,
          description: work.description
        });
      }
  	}

  	return works;
  },

  fromLinkedin: function(worksFromProvider) {
  	works = undefined;
  	if (worksFromProvider) {
  		works = [];
      for (var i in worksFromProvider) {
      	work = worksFromProvider[i];
      	
        works.push({
          employerName: work.company.name,
          title: work.title,
          from: new Date(work.startDate.year, work.startDate.month, 1),
          to: work.end_date = work.endDate === undefined ? undefined : new Date(work.endDate.year, work.endDate.month, 1),
          description: work.summary,
        });
      }
  	}

  	return works;
  }
};

module.exports = workUtil;
