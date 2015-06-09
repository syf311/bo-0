var jwt = require('jwt-simple');
var jwtConfig = require('../config/jwt');
var moment = require('moment');

authUtil = {
  isLoggedIn: function (req, res, next) {
	  if (!req.headers.authorization) {
	    	return res.status(400).send({ message: 'Please make sure your request has an Authorization header' });
	  }

	  var payload = authUtil.getTokenPayload(req.headers.authorization);

	  if (authUtil.isTokenExpired(payload)) {
	    return res.status(401).send({ message: 'Token has expired' });
	  }

	  req.userId = payload.userId;

  	next();
  },

  createToken: function (user) {
		var payload = {
			userId: user._id,
			iat: moment().unix(),
			exp: moment().add(jwtConfig.expiresAfter[0], jwtConfig.expiresAfter[1]).unix()
		};

		var token = jwt.encode(payload, jwtConfig.secret);
    return token;
  },

  isTokenExpired: function (payload) {
  	return (payload.exp <= moment().unix());
  },

  getTokenPayload : function(header) {
	var token = header.split(' ')[1];
	var payload = jwt.decode(token, jwtConfig.secret);

	return payload;
  },

  echoToken: function(req, res) {
    var token = authUtil.createToken(req.user);
    res.send({ token: token });
  }  
};

module.exports = authUtil;