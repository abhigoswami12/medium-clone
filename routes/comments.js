var express = require('express');
var router = express.Router();

var Comment = require("../models/Comment");
var Article = require("../models/Article");

//update comment
router.get('/:commentId/edit', (req, res, next) => {
    
    // Comment.findById(req.params.commentId, (err, comment) => {
    //     if(err) return next(err);
    //     res.render('updateComment', { comment });
    // })
    Comment.findById(req.params.commentId, (err, comment) => {
        if(err) return next(err);
        if(comment.author.toString() === req.user.id) {
            res.render('updateComment', { comment });
        } else {
            res.redirect('/articles/' + comment.articleId)
        }
    })
})

router.post('/:commentId/edit', (req, res, next) => {
    // Comment.findByIdAndUpdate(req.params.commentId, req.body, (err, comment) => {
    //     if(err) return next(err);
    //     res.redirect('/articles/' + comment.articleId)
    // })
    Comment.findById(req.params.commentId, (err, comment) => {
        if (err) return next(err);
        if(comment.author.toString() === req.user.id) {
            comment.content = req.body.content;
            comment.save();
            res.redirect('/articles/' + comment.articleId)
            
        } else {
            res.redirect("/articles/" + comment.articleId);
        }
    })
})

//delete comment
router.get('/:commentId/delete', (req, res, next) => {
    // Comment.findByIdAndDelete(req.params.commentId, (err, comment) => {
    //     if(err) return next(err);
    //     res.redirect('/articles/' + comment.articleId);
    // })
    Comment.findById(req.params.commentId, (err, comment) => {

        if(err) return next(err);
        // console.log("AUTHOR", comment.author);
        // console.log("USER", req.user.id);
        if(comment.author.toString() === req.user.id) {
            Article.findByIdAndUpdate(comment.articleId, { $pull: { comments: comment.id } }, (err, article) => {
                if(err) return next(err);
                comment.remove();
                res.redirect("/articles/" + comment.articleId);
            })
        } else {
            res.redirect("/articles/" + comment.articleId);
        }
    })
})


module.exports = router;