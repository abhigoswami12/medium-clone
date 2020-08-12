var express = require("express");
var router = express.Router();

var auth = require('../middlewares/auth');

var Article = require('../models/Article');
var Comment = require('../models/Comment');
var User = require('../models/User');

//create article
router.get('/new', auth.verifyUserLogin, (req, res, next) => {
    res.render('createArticle');

})

router.get('/', (req, res, next) => {
    // console.log("requested sessiion", req.session)
    Article.find().populate('author', 'name email').exec((err, articles) => {
        // console.log("responsed user",articles)
        if(err) return next(err);
        res.render('listArticles', { articles });
    })
})


router.get('/myarticles', auth.verifyUserLogin, (req, res, next) => {
    Article.find().populate('author', 'name email').exec((err, articles) => {
        // console.log(article.author)
        res.render('myArticles', { articles });
    })
})
//post
router.post('/',auth.verifyUserLogin, (req, res, next) => {
    req.body.author = req.user._id;
    Article.create(req.body, (err, article) => {
        if (err) return next(err);
        res.redirect('/articles');
    });
   
})
//METHOD-1
//read single article
// router.get('/:id', (req, res, next) => {
//     var articleId = req.params.id;
//     var warn = req.flash('warn')[0];//array
//     Article.findById(articleId).populate("author", 'name email').populate('comments').lean().exec((err, article) => { 
//         User.populate(article.comments, 'author', function(err, comments) {
//             if (err) return next(err);
//             article.comments = comments;
//             // console.log(article.comments)
//             res.render('singleArticle', { article, warn })
//         })
       
//     })
// })


//METHOD-2
//read single article
router.get('/:id', (req, res, next) => {
    var articleId = req.params.id;
    var warn = req.flash('warn')[0];//array
    Article.findById(articleId).populate("author", 'name email').populate({
        path: 'comments',
        populate: {
            path: 'author',
        }
    }).exec((err, article) => {
            if (err) return next(err);
            
            res.render('singleArticle', { article, warn })

    })
})

//create comment
router.post('/:id/comments', (req, res, next) => {
    var articleId = req.params.id;
    // console.log("REQUESTED USER", req.user);
    if(req.user === null) {
        req.flash("warn", `*Warning!! You First Need to Login to Access "Comments"!!`);
        return res.redirect("/articles/" + articleId);
    }
    req.body.articleId = articleId;
    req.body.author = req.user.id;
    Comment.create(req.body, (err, comment) => {
        if(err) return next(err);
        Article.findByIdAndUpdate(articleId, { $push: { comments: comment.id } },(err, article) => {
            if (err) return next(err);
            res.redirect("/articles/" + articleId);
        })
    })
})

//update article
router.get('/:id/edit',auth.verifyUserLogin, (req, res, next) => {
    var articleId = req.params.id;
    Article.findById(articleId, (err, article) => {
        if(err) return next(err);
        if(article.author.toString() === req.user.id) {
            res.render('updateArticle', { article });
        } else {
            res.redirect('/articles');
        }
    })
})

router.post('/:id/edit',auth.verifyUserLogin, (req, res, next) => {
    var articleId = req.params.id;
    Article.findById(articleId, (err, article) => {
        if (err) return next(err);
        if(article.author.toString() === req.user.id) {
        article.title = req.body.title;
        article.description = req.body.description;
        article.save();
        res.redirect('/articles');

        } else {
            res.redirect('/articles');
        }
    })
})


//delete aritcle
router.get('/:id/delete',auth.verifyUserLogin, (req, res, next) => {
    Article.findById(req.params.id, (err, article) => {
        if (err) return next(err);
        if(article.author.toString() === req.user.id) {
            article.remove();
            res.redirect("/articles");

        } else {
            res.redirect('/articles');
        }
    })
})

//likes
router.get('/:id/likes', (req, res, next) => {
    let articleId = req.params.id;
    if (req.user === null) {
        req.flash("warn", `*Warning!! You First Need to Login to Access "Likes"!!`);
        return res.redirect("/articles/" + articleId);
    }
    Article.findById(articleId,(err, article) => {
        // var likesArrayList = article.likesArray.map(userId => userId.toString());
        if (!article.likesArray.includes(req.user.id)) {
            article.likesArray.push(req.user.id);
            article.likes = article.likes + 1;
            article.save();
            
        } else {
            article.likesArray.pull(req.user.id);
            article.likes = article.likes - 1;
            article.save();
        }
        // console.log(article)
        res.redirect("/articles/" + articleId);
    })
})

//likes
// router.get('/:id/likes', (req, res, next) => {
//     let articleId = req.params.id;

//    Article.findByIdAndUpdate(articleId, {$push: {likesArray: req.user.id}, $inc: {likes: 1}}, (err, article) => {
//        res.redirect("/articles/" + articleId);
//    })
// })




//favourites
router.get('/:id/favourites', (req, res, next) => {
    let articleId = req.params.id;
    console.log("ARTICLeID: ", articleId)
    console.log("Loggedin user: ", req.user.id)
    if (req.user === null) {
        req.flash("warn", `*Warning!! You First Need to Login to Access "Favourites"!!`);
        return res.redirect("/articles/" + articleId);
    }
    User.findById(req.user.id, (err, user) => {
        var favouritesList = user.favourites.map(articleId => articleId.toString());
        if(!favouritesList.includes(articleId)) {
            user.favourites.push(articleId)
            user.save();

        } else {
            user.favourites.pull(articleId);
            user.save();
        }
        console.log("USER", user);
        res.redirect("/articles/" + articleId);
    })
    

})

//follow
router.get('/:id/follow', (req, res, next) => {
    let articleId = req.params.id;
    if (req.user === null) {
        req.flash("warn", `*Warning!! You First Need to Login to Access "Follow"!!`);
        return res.redirect("/articles/" + articleId);
    }
    Article.findById(articleId, (err, article) => {
        console.log("Author of the ARTICLe: ", article.author)
        console.log(
          "Loggedin user: ",
          req.user.id,
          article.author != req.user.id
        );
        User.findById(req.user.id, (err, user) => {
            if(article.author != req.user.id) {
                var followingList = user.following.map(userId => userId.toString());
                if (!followingList.includes(article.author)) {
                    user.following.push(article.author);
                    user.save();
                } else {
                    user.following.pull(article.author);
                    user.save();
                }
                console.log("USER", user)
                res.redirect("/articles/" + articleId);
            } else {
                console.log("USER", user);
                return;
            }
        })

    })
})



module.exports = router;