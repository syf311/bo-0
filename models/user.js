var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    local            : {
      email        : String,
      password     : String,
      displayName  : String,
      picture      : String
    },
    facebook         : {
      id           : String,
      token        : String,
      email        : String,
    },
    linkedin				 : {
    	id             : String,
    	token          : String,
    	email					 : String,
    }
});

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('local.password')) {
    return next();
  }

  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.local.password, salt, null, function(err, hash) {
      user.local.password = hash;
      next();
    });
  });
});

userSchema.methods.validatePassword = function(password, done) {
  bcrypt.compare(password, this.local.password, function(err, isMatch) {
    done(err, isMatch);
  });
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
