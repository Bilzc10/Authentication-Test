//Dependencies
  //Express
const express = require('express');
const flash = require('req-flash');
const app = express();
  //bodyParser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
  //passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());
  //bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;
  //sessions
const session = require('express-session');
app.use(session({
  secret: 'danny devito is the best',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());
app.use(passport.session());
  //MongoDB (Mongoose)
const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator");
mongoose.connect('mongodb://localhost/MyDatabase');

const Schema = mongoose.Schema;
const UserDetail = new Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    date: { type: Date, default: Date.now },
    email: String,
    name: String,
    id: String
  });
UserDetail.plugin(uniqueValidator);
UserDetail.methods.validPassword = function(password, done) {
  bcrypt.compare(password, this.passwordHash).then(function(res) {
    done(res);
  });
};
UserDetail.virtual("password").set(function(value) {
  this.passwordHash = bcrypt.hashSync(value, 12);
});
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');
  //bcrypt

//Express pages
app.get('/login', (req, res) => res.sendFile('signin.html', {root: __dirname}));
app.get('/signup', (req, res) => res.sendFile('signup.html', {root: __dirname}));
app.get('/success', (req, res) => {
  if (req.session.loggedIn) {
    res.send(req.flash());
    //res.send("Welcome " + req.session.username + "!");
  } else {
    res.redirect('/signup');
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
  }
);
app.post("/signup", (req, res, next) => {
  const { username, password } = req.body;
  UserDetails.create({ username, password })
    .then(user => {
      req.login(user, err => {
        if (err) {
          next(err);
        } else {
          req.session.username = req.user.username;
          req.session.loggedIn = true;
          req.session.save();
          req.flash("wot", "error: Success!");
          res.redirect("/success");
        }
      });
    })
    .catch(err => {
      if (err.name === "ValidationError") {
        req.flash("Sorry, that username is already taken.");
        res.redirect("/signup");
      } else next(err);
    });
});
/*app.post('/signup', function(req, res) {
  let results = {};
  if (req.body.username.length >= 32) {
    results.err = true;
    results.errMsg = "Name is too long";
    return results;
  }
  UserDetails.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) {
      results.err = true;
      results.unknownErr = true;
      results.errMsg = err;
      return results;
      res.redirect('/error');
    }

    if (user) {
      results.err = true;
      results.errMsg = "User already exists.";
      res.redirect('/error');
    } else {
      let hashedPW;
      bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        hashedPW = hash;
      });
      let user = {
        username: req.body.username,
        password: hashedPW
      };
      UserDetails.create(user, function(err, newUser) {
        if (err) {
          return err;
          res.redirect('/error');
        }
        passport.authenticate('local')(req, res, function () {
          res.redirect('/success');
        })
      });
    }
  });
});*/

//listen
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App listening on port ' + port));

//passport stuff
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
passport.use(new LocalStrategy(
  function(username, password, done) {
      UserDetails.findOne({
        username: username
      }, function(err, user) {
        if (err) {
          console.log("error");
          return done(err);
        }

        if (!user) {
          console.log("non exstent user");
          return done(null, false);
        } else {
          user.validPassword(password, function(res) {
            if (res) {
              console.log("success");
              return done(null, user);
            } else {
              return done(null, false);
            }
          });
        }
      });
  }
));
