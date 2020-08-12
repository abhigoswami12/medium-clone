var User = require('../models/User');

exports.verifyUserLogin = (req, res, next) => {
    var userPassportId =req.session && req.session.passport && req.session.passport.user;
    if(req.session && req.session.userId) {
        next();
    } else if(userPassportId) {
        next();
    }
    else {
        req.session.returnsTo = req.originalUrl;
        req.flash("warn", "You need to first login to access this route");
        res.redirect('/users/login');
    }

}

exports.userInfo = (req, res, next) => {
    var userId = req.session && req.session.userId;
    var userPassportId = req.session && req.session.passport && req.session.passport.user;
    if(userId) {
        User.findById(userId, "-password", (err, user) => {
            req.user = user;
            res.locals.user = user;
            next();
        })
    } else if (userPassportId) {
        User.findById(req.session.passport.user, (err, user) => {
        //   req.user = user;
          res.locals.user = user;
          next();
        })
    } else {
            req.user = null;
            res.locals.user = null;
            next();
        }
    }
