var express = require('express');
var router = express.Router();
var User = require('../../models/user');

router.get('/account', function(req, res) {
	User.findById(req.userId, function(err, user) {
		if (err) {
			return res.status(500).send({ message: err });
		}
	  
	  res.send(user);
  });
});

router.put('/account', function(req, res) {
  User.findById(req.userId, function(err, user) {
  	if (err) {
      return res.status(500).send({ message: err });
  	}

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    user.local.displayName = req.body.displayName || user.local.displayName;
    user.local.email = req.body.email || user.local.email;
    user.save(function(err) {
    	if (err) {
    		return res.satus(500).send({ message: err });
    	}

      res.status(200).end();
    });
  });
});

module.exports = router;