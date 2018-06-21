//Dependencies
  //Express
const express = require('express');
const app = express();

  //bodyParser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
  //passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());
  //sessions
const session = require('express-session');
app.use(session({
  secret: 'danny devito is the best',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.session());
  //MongoDB (Mongoose)
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/MyDatabase');

const Schema = mongoose.Schema;
const UserDetail = new Schema({
    username: String,
    password: String,
    date: { type: Date, default: Date.now },
    email: String,
    name: String,
    id: String
  });
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');
  //bcrypt
var bcrypt = require('bcrypt');
const saltRounds = 10;

//Express pages
app.get('/login', (req, res) => res.sendFile('signin.html', {root: __dirname}));
app.get('/signup', (req, res) => res.sendFile('signup.html', {root: __dirname}));
app.get('/success', (req, res) => {
  console.log(req.session);
  if (req.session.loggedIn) {
    res.send("Welcome " + req.session.username + "!");
  } else {
    res.redirect('/');
  }
});
app.get('/error', (req, res) => res.send("The server doesn't like you, so you weren't logged in."));

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/success');
    req.session.username = req.user.username;
    req.session.loggedIn = true;
    req.session.save();
  });

app.post('/signup', function(req, res) {
  signUp(req.body.username, req.body.password);
})

//listen
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App listening on port ' + port));

//passport stuff
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    cb(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
      UserDetails.findOne({
        username: username
      }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }

        if (user.password != password) {a
          return done(null, false);
        }
        return done(null, user);
      });
  }
));

function signUp(username, password) {
  let results = {};
  if (username.length >= 32) {
    results.err = true;
    results.errMsg = "Name is too long";
    return results;
  }
  UserDatils.findOne({
    username: Username
  }, function(err, user) {
    if (err) {
      results.err = true;
      results.unknownErr = true;
      results.errMsg = err;
      return results;
    }

    if (user) {
      results.err = true;
      results.errMsg = "User already exists.";
    } else {
      let hashedPW;
      bcrypt.hash(password, saltRounds, function(err, hash) {
        return hash;
        hashedPW = hash;
      });
      let user = {
        username = username,
        password = hashedPW
      }
    }
  })
}
