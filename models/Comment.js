var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ObjectId = Schema.Types.ObjectId;

var commentSchema = new Schema({
    content: { type: String },
    articleId: { type: ObjectId, required: true, ref: "Article" },
    author: { type: Schema.Types.ObjectId, required: true, ref: "User"}
}, { timestamps: true })

module.exports = mongoose.model("Comment", commentSchema);