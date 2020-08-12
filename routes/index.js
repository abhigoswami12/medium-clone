var express = require('express');
var router = express.Router();

var passport = require("passport");


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("requested sessiion", req.session);
  // res.render('index');
  res.redirect('/articles')
});

//google routes
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/articles');
  });


//github routes
router.get('/auth/github',
  passport.authenticate('github'));

router.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/articles');
  });
module.exports = router;
