//Dependencies
  //Express
const express = require('express');
const app = express();
  //bodyParser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
  //passport.js
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => res.sendFile('auth.html', {root: __dirname}));
app.get('/success', (req, res) => res.send("Welcome" + req.query.username + "!"));
app.get('/error', (req, res) => res.send("The server doesn't like you, so you weren't logged in."));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App listening on port ' + port));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    cb(err, user);
  });
});
