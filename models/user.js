var mongoose=require("mongoose");
var passportLocalMongoose= require("passport-local-mongoose");

//USER MODEL
var UserSchema = new mongoose.Schema({
    name: { type: String},
    email: { type: String,  unique: true },
    password: { type: String },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    usertype: { type:String},
    location: {type:String},
    lat:Number,
    lng:Number,
    image:{ type:String, default:"placholder.jpg"},
    pincode:Number,
    status:{ type:Boolean, default: false}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);