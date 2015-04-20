var express = require('express');
var router = express.Router();

module.exports = function(passport) {
  router.get('/login', function(req, res) {
  	res.render('login.ejs', { message: req.flash('loginMessage') }); 
  });

  router.get('/signup', function(req, res) {
  	res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  router.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/auth/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  router.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/auth/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  router.get('/facebook', passport.authenticate('facebook', { scope : 'email, user_birthday, user_education_history, user_location, user_work_history' }));

  // handle the callback after facebook has authenticated the user
  router.get('/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect : '/profile/facebook',
      failureRedirect : '/'
  }));

  router.get('/connect/local', function(req, res) {
  	res.render('connect-local.ejs', { message: req.flash('signupMessage') });
  });

  router.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/auth/connect/local', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  router.get('/connect/facebook', passport.authorize('facebook', { scope : 'email, user_birthday, user_education_history, user_location, user_work_history' }));

  // handle the callback after facebook has authorized the user
  router.get('/connect/facebook/callback',
    passport.authorize('facebook', {
        successRedirect : '/profile/facebook',
        failureRedirect : '/'
  }));

  router.get('/unlink/local', function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

  // facebook -------------------------------
  router.get('/unlink/facebook', function(req, res) {
    var user            = req.user;
    user.facebook.token = undefined;
    user.save(function(err) {
        res.redirect('/profile');
    });
  });


  return router;
};

