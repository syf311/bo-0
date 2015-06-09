var async = require('async');
var express = require('express');
var recCfg = require('../../config/rec');
var request = require('request');
var router = express.Router();
var UserScore = require('../../models/userScore');

router.get('/group/rec', function(req, res) {
  var userId = req.query.userId;
  var groupCnt = req.query.groupCnt;

  request({
    url: recCfg.segSelection.baseUrl,
    qs: null,
    method: 'POST',
    json: {
        user: userId,
        num: parseInt(groupCnt)
    }
  }, function(error, response, body){
    if(error) {
      return res.status(500).send({ message: error });
    } else {
      if (response.statusCode !== 200) {
        // seg selection engine errored out
        return res.status(500).send({ message: 'seg selection errored out:' + body });
      }

      //console.log(body);
      var groups = [];
      async.each(body.itemScores, function(itemScore, callback) {
        recommendOneGroup(groups, userId, itemScore.seg, callback);
      }, function(err) {
        if (err) {
          return res.status(500).send({ message: err });  
        } else {
          return res.send(groups);  
        }
      })
    }
  });
});

function recommendOneGroup(groups, userId, segId, callback) {
  async.waterfall([
    function(callback) {
      UserScore
        .find({ 'userId': userId, 'segId': segId })
        .sort({ 'score': -1 })
        .limit(1)
        .exec(function(err, userScores) {
          if (err) {
            callback(err);
          }
          
          var group = [userId, userScores[0].targetUserId];
          callback(null, group, userScores[0].targetUserId);
      });
    },
    function(group, userIdB, callback) {
      recommendGroupMember(group, userIdB, callback);
    },
    function(group, userIdC, callback) {
      recommendGroupMember(group, userIdC, callback);
    },
    function(group, userIdD, callback) {
      recommendGroupMember(group, userIdD, callback);
    },
  ], function (err, result) {
    if (err) {
      callback(err);
    } else {
      groups.push(result);
      callback(null);
    }
  });
}

function recommendGroupMember(group, userId, callback) {
  request({
    url: recCfg.segSelection.baseUrl,
    qs: null,
    method: 'POST',
    json: {
        user: userId,
        num: 1
    }
  }, function(error, response, body) {
    //console.log(body);
    if (error) {
      callback(error);
    } else {
      if (response.statusCode !== 200)  {
        callback({ message: 'seg selection errored out:' + body })
      }
      else {
        var itemScores = body.itemScores;
        UserScore
          .find({ 'userId': userId, 'segId': itemScores[0].seg, 'targetUserId': {'$nin': group } })
          .sort({ 'score': -1 })
          .limit(1)
          .exec(function(err, userScores) {
            if (err) {
              //return res.status(500).send({ message: err });
              callback(err);
            }
            
            group.push(userScores[0].targetUserId)
            callback(null, group, userScores[0].targetUserId);
        });
      }
    }
  });
}

module.exports = router;