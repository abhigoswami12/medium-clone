var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

var GitHubStrategy = require("passport-github").Strategy;
var User = require('../models/User');



//google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile);
        var email = profile.emails[0].value;
        // var name = profile.displayName;
        var googleUser = {
            // name: profile.displayName,
            email: email,
            providers: [profile.provider],
            google: {
                name: profile.displayName,
                image: profile.photos[0].value
            }
        }
        User.findOne({ email }, (err, user) => {
            if (err) cb(err, false);
            if (!user) {
                User.create(googleUser, (err, user) => {
                    if (err) cb(err, false);
                    cb(null, user);
                })
            }
            if (user) {
                if (user.providers.includes(profile.provider)) {
                    return cb(null, user)
                } else {
                    // user.name = profile.displayName;
                    user.providers.push(profile.provider);
                    user.google = { ...googleUser.google };
                    user.save((err, updatedUser) => {
                        cb(null, updatedUser);
                    })

                }
            }
        })


    }
));

//github strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback"
},
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile);
        var email = profile.emails[0].value;
        var githubUser = {
            name: profile.displayName,
            email: email,
            providers: [profile.provider],
            github: {
                name: profile.displayName,
                username: profile.username,
                image: profile.photos[0].value
            }
        }
        User.findOne({ email }, (err, user) => {
            // console.log(err, user)
            if (err) cb(err, false)
            if (!user) {
                User.create(githubUser, (err, user) => {
                    if (err) cb(err, false);
                    cb(null, user);
                })
            } else {
                if (user.providers.includes(profile.provider)) {
                    cb(null, user)
                } else {
                    user.name = profile.displayName;
                    user.providers.push(profile.provider);
                    user.github = { ...githubUser.github };
                    user.save((err, updatedUser) => {
                        cb(null, updatedUser);
                    })
                }
            }
        })
    }
));

//serializeUser
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

//deserializeUser
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

