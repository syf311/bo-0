var authConfig = require('../config/auth');
var auth = require('../utils/auth');
var express = require('express');
var jwt = require('jwt-simple');
var jwtConfig = require('../config/jwt');
var request = require('request');
var router = express.Router();
var User = require('../models/user');
var work = require('../utils/work');

router.post('/login', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	User.findOne({ 'local.email' :  email }, function(err, user) {
    if (err) {
    	return res.status(500).send({ message: err });
    }

    if (!user) {
    	return res.status(401).send({ message: 'No user found.' });
    }

    user.validatePassword(password, function(err, isValid) {
      if (!isValid) {
      	return res.status(401).send({ message: 'Oops! Wrong password.' });
   		}

			res.json({ token: auth.createToken(user) });
		});
	});
});

router.post('/signup', function(req, res) {
  User.findOne({ 'local.email': req.body.email }, function(err, existingUser) {
    if (err) {
      return res.status(500).send({ message: err });
    }

    if (existingUser) {
      return res.status(409).send({ message: 'Email is already taken.' });
    }

    var user = new User();
    user.local.displayName = req.body.displayName;
    user.local.email = req.body.email;
    user.local.password = req.body.password;

    user.save(function(err) {
    	if (err) {

    		return res.status(500).send({ message: err });
    	}

      res.send({ token: auth.createToken(user) });
    });
  });
});

router.post('/facebook', function(req, res, next) {
	req.provider = 'fromFacebook';
  var accessTokenUrl = authConfig.facebookAuth.graphApiUrl + '/oauth/access_token';
  var graphApiUrl = authConfig.facebookAuth.graphApiUrl + '/me';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: authConfig.facebookAuth.clientSecret,
    redirect_uri: req.body.redirectUri
  };

  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
    if (response.statusCode !== 200) {
      return res.status(500).send({ message: accessToken.error.message });
    }


    // Step 2. Retrieve profile information about the current user.
    request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
      if (response.statusCode !== 200) {
        return res.status(500).send({ message: profile.error.message });
      }



      var picture = authConfig.facebookAuth.graphApiUrl + '/' + profile.id + '/picture?type=large';

      if (req.headers.authorization) {
        User.findOne({ 'facebook.id': profile.id }, function(err, existingUser) {
        	if (err) {
        		return res.status(500).send( { message: err} );
        	}

      		var payload = auth.getTokenPayload(req.headers.authorization);
          if (existingUser && !auth.isTokenExpired(payload)) {
            return res.status(409).send({ message: 'This facebook account is already linked to another account' });
          }

          User.findById(payload.userId, function(err, user) {
          	if (err) {
          		return res.status(500).send({ message: err });
          	}

            if (!user) {
              return res.status(404).send({ message: 'User not found' });
            }

            user.facebook.id = profile.id;
            user.facebook.email = profile.email;
            user.local.picture = user.local.picture || picture;
            user.local.displayName = user.local.displayName || profile.name;
            user.save(function(err) {
            	if (err) {
            		return res.status(500).send({ message: err });
            	}

              req.user = user;
	            req.profile = profile.work;
	            return next();
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ 'facebook.id': profile.id }, function(err, existingUser) {
        	if (err) {
        		return res.status(500).send({ message: err });
        	}

          if (existingUser) {
            req.user = existingUser;
            req.profile = profile.work;
            return next();
          } else {
          	var user = new User();
	          user.facebook.id = profile.id;
	          user.facebook.email = profile.email;
	          user.local.picture = picture;
	          user.local.displayName = profile.name;
	          user.save(function(err) {
	          	if (err) {
	          		return res.status(500).send({ message: err });
	          	}
	            req.user = user;
	            req.profile = profile.work;
	            return next();
	          });
          }
        });
      }
    });
  });
}, work.populateWork, auth.echoToken);

router.post('/linkedin', function(req, res, next) {
	req.provider = 'fromLinkedin';
  var accessTokenUrl = 'https://www.linkedin.com/uas/oauth2/accessToken';
  var peopleApiUrl = 'https://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address,picture-url,location,positions,skills,interests,educations,date-of-birth)';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: authConfig.linkedinAuth.clientSecret,
    redirect_uri: req.body.redirectUri,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post(accessTokenUrl, { form: params, json: true }, function(err, response, body) {
    if (response.statusCode !== 200) {
      return res.status(response.statusCode).send({ message: body.error_description });
    }
    var params = {
      oauth2_access_token: body.access_token,
      format: 'json'
    };

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: peopleApiUrl, qs: params, json: true }, function(err, response, profile) {

      if (response.statusCode !== 200) {
        return res.status(500).send({ message: profile.error_description });
      }

      // Step 3a. Link user accounts.
      if (req.headers.authorization) {
        User.findOne({ 'linkedin.id': profile.id }, function(err, existingUser) {
        	if (err) {
        		return res.status(500).send( { message: err} );
        	}

        	var payload = auth.getTokenPayload(req.headers.authorization);

          if (existingUser && !auth.isTokenExpired(payload)) {
            return res.status(409).send({ message: 'This linkedin account is already linked to another account' });
          }

          User.findById(payload.userId, function(err, user) {
          	if (err) {
          		return res.status(500).send({ message: err });
          	}

            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
           
            user.linkedin.id = profile.id;
            user.linkedin.email = profile.emailAddress;
            user.local.picture = user.local.picture || profile.pictureUrl;
            user.local.displayName = user.local.displayName || profile.firstName + ' ' + profile.lastName;
            user.save(function() {
            	if (err) {
            		return res.status(500).send({ message: err });
            	}

              req.user = user;
	            req.profile = profile.positions.values;
	            return next();
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ 'linkedin.id': profile.id }, function(err, existingUser) {
        	if (err) {
        		return res.status(500).send({ message: err });
        	}

          if (existingUser) {
            req.user = existingUser;
            req.profile = profile.positions.values;
            return next();
          }

          var user = new User();
          user.linkedin.id = profile.id;
          user.linkedin.email = profile.emailAddress;
          user.local.picture = profile.pictureUrl;
          user.local.displayName = profile.firstName + ' ' + profile.lastName;
          user.save(function() {
            if (err) {
	          		return res.status(500).send({ message: err });
	          	}
            req.user = user;
            req.profile = profile.positions.values;
            return next();
          });
        });
      }
    });
  });
}, work.populateWork, auth.echoToken);

router.get('/unlink/:provider', auth.isLoggedIn, function(req, res) {
  var provider = req.params.provider;

  User.findById(req.userId, function(err, user) {
  	if (err) {
  		return res.status(500).send({ message: err });
  	}

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    user[provider] = undefined;

    user.save(function(err) {
    	if (err) {
  			return res.status(500).send({ message: err });
  		}
      
      res.status(200).end();
    });
  });
});

module.exports = router;
