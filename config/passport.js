var passport = require('passport');
var {User, SuperUser} = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    if(user)
      done(err, user);
    else{
      SuperUser.findById(id, (e, usr) => {
        done(e, usr);
      });
    }
  });
});

passport.use('local.signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  req.checkBody('email', 'Invalid email!').notEmpty().isEmail();
  req.checkBody('password', 'Invalid password!').notEmpty().isLength({
    min: 4
  });

  var errors = req.validationErrors();
  if (errors) {
    var messages = [];
    errors.forEach(function(error) {
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  }
  User.findOne({
    'email': email
  }, function(err, user) {
    if (err) {
      return done(err);
    }
    if (user) {
      return done(null, false, {
        message: 'This email is already being used.'
      });
    }
    var newUser = new User();
    newUser.name = req.body.name;
    newUser.city = req.body.city;
    newUser.state = req.body.state;
    newUser.email = email;
    newUser.password = newUser.encryptPassword(password);
    newUser.save(function(err, result) {
      if (err) {
        return done(err);
      }
      return done(null, newUser);
    });
  });
}));

passport.use('local.signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  req.checkBody('email', 'Invalid email!').notEmpty().isEmail();
  req.checkBody('password', 'Invalid password!').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    var messages = [];
    errors.forEach(function(error) {
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  }
  User.findOne({
    'email': email
  }, function(err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, {
        message: 'User not found!'
      });
    }
    if (!user.validPassword(password)) {
      return done(null, false, {
        message: 'wrong password!'
      });
    }
    return done(null, user);
  });
}));




///////////////// SUPER USER ///////////////////////////
passport.use('local.supersignin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  req.checkBody('email', 'Invalid email!').notEmpty().isEmail();
  req.checkBody('password', 'Invalid password!').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    var messages = [];
    errors.forEach(function(error) {
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  }
  SuperUser.findOne({
    'email': email
  }, function(err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, {
        message: 'User not found!'
      });
    }
    if (!user.validPassword(password)) {
      return done(null, false, {
        message: 'wrong password!'
      });
    }
    return done(null, user);
  });
}));