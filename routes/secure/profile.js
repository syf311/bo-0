var express = require('express');
var router = express.Router();

var Work = require('../../models/work');

router.get('/profile/work', function(req, res) {

	Work.findOne({ 'userId': req.userId }, function(err, work){
		if (err) {
			return res.status(500).send({ message: err });
		}

		if (!work) {
			res.status(204).end();
		}

		res.send(work);
	});
});

router.post('/profile/work', function(req, res) {

  var work = new Work(); 
	work.work = req.body.work;
	work.userId = req.body.userId;
  work.save(function(err) {
  	if (err) {
  		return res.status(500).send({ message: err });
  	}

    res.end();
  });
});

router.put('/profile/work', function(req, res) {

	var work = {
		userId: req.body.userId,
		work: req.body.work  		
	};

	Work.findOneAndUpdate({ userId: req.body.userId }, work, { upsert: true }, function(err) {
		if (err) {
  		return res.status(500).send({ message: err });
  	}

    res.end();
	});
});

module.exports = router;
