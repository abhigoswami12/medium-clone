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
    Article.find().populate('author', 'name email').exec((err, articles) => {
        if(err) return next(err);
        res.render('listArticles', { articles });
    })
})


router.get('/myarticles', (req, res, next) => {
    Article.find().populate('author', 'name email').exec((err, articles) => {

        res.render('myArticles', { articles });
    })
})
//post
router.post('/', (req, res, next) => {
    req.body.author = req.user._id;
    Article.create(req.body, (err, article) => {
        if (err) return next(err);
        res.redirect('/articles');
    });
   
})

//read single article
router.get('/:id', (req, res, next) => {
    var articleId = req.params.id;
    Article.findById(articleId).populate("author", 'name email').populate('comments').exec((err, article) => {
        if (err) return next(err);
        res.render('singleArticle', { article })
    })
})

//create comment
router.post('/:id/comments', (req, res, next) => {
    var articleId = req.params.id;
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
router.get('/:id/edit', (req, res, next) => {
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

router.post('/:id/edit', (req, res, next) => {
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
router.get('/:id/delete', (req, res, next) => {
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
        console.log(article)
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
    User.findById(req.user.id, (err, user) => {
        var favouritesList = user.favourites.map(articleId => articleId.toString());
        if(!favouritesList.includes(articleId)) {
            user.favourites.push(articleId)
            user.save();

        } else {
            user.favourites.pull(articleId);
            user.save();
        }
            res.redirect("/articles/" + articleId);
    })
    

})

//follow
router.get('/:id/follow', (req, res, next) => {
    let articleId = req.params.id;
    User.findById(req.user.id, (err, user) => {
        var followingList = user.following.map(userId => userId.toString());
        if(!followingList.includes(req.user.id)) {
            user.following.push(req.user.id);
            user.save();
        } else {
            user.following.pull(req.user.id);
            user.save();
        }
        res.redirect("/articles/" + articleId);
    })
})



module.exports = router;