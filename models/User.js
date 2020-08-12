var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;


var userSchema = new Schema({
    name: {
        type: String,
        // required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        // required: true,
        // min: 8
    },
    favourites: [ { type: Schema.Types.ObjectId, ref: "Article" } ],
    following: [{ type: Schema.Types.ObjectId, ref: "User" } ],
    github: {
        name: String,
        username: String,
        image: String
    },
    google: {
        name: String,
        image: String
    },
    providers: [String]
}, { timestamps: true });

userSchema.pre('save', function(next) {
     // console.log(this);//as soon as request comes to user.Create, if a pre savehook is defined then first it will be executed.Here, we presave hook is still not sending any request , so user.create willlnot be executed.however all validations and id will be assigned here only.simultaneously do console.log in user.create,one without next() and other using next();
    if(this.password && this.isModified('password')) {
        this.password = bcrypt.hashSync(this.password, 10)
    }
    next();
});

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password);// returns true or false
}

module.exports = mongoose.model('User', userSchema);