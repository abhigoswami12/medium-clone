var express = require('express');
var router = express.Router();

var User  = require('../models/User');
var auth = require('../middlewares/auth');
var Article = require('../models/Article');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });


//render register form
router.get('/register', (req, res, next) => {
  res.render('createRegisterForm');
})

router.post('/register', (req, res, next) => {
  // console.log("entered");
  User.create(req.body, (err, user) => {
    // console.log(err, user)
    if(err) next(err);
    res.redirect('/users/login');

  })
})

//all registered users list
router.get("/", auth.verifyUserLogin, (req, res, next) => {
  User.find({}, (err, users) => {
    if (err) return next(err);
    res.render("listUsers", { users });
  })
})

//render login form
router.get('/login', (req, res, next) => {
  var warn = req.flash('warn')[0];//array
  // console.log(warn);
  res.render('createLoginForm', { warn });
})

router.post('/login', (req, res, next) => {
  var { email, password } = req.body;
  if(!email || !password) {
    req.flash('warn', '*Email & Password are required!')
    return res.redirect("/users/login");
  }
    
  User.findOne({ email }, (err, user) => {
    if(err) next(err);
    if(!user) {
      req.flash('warn', '*Email address not found! Please enter correct email!')
      return res.redirect("/users/login");
    } 
    if(!user.validatePassword(password)) {
      req.flash("warn", "*Password is wrong! Please enter correct password!");
      return res.redirect("/users/login");
    } 


    req.session.userId = user.id;
    // console.log("requested", req.session)
    res.redirect(req.session.returnsTo || "/articles");
    delete req.session.returnsTo;
  })
})

//logout
router.get('/logout', (req, res, next) => {
  // if(err) return next(err);
  console.log("REQUESTED SESSION", req.session)
  req.session.destroy();

  res.clearCookie('connect-sid');
  res.redirect('/users/login');

})
// router.get('/logout', (req, res, next) => {
//   req.session.destroy();
//   res.clearCookie('connect-sid');
//   res.redirect('/users/login')
// })


module.exports = router;
