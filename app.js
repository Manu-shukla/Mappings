var express=require("express"),
    app=express(),
    mongoose=require("mongoose"),
    // nodemailer = require('nodemailer'),
    bodyParser=require("body-parser"),
    passport=require("passport"),
    LocalStrategy=require("passport-local"),
    User=require("./models/user"),
    flash=require("connect-flash"),
    // bcrypt = require('bcrypt-nodejs'),
    // async = require('async'),
    // crypto = require('crypto'),
    
    //REQUIRING ROUTES
    userRoutes=require("./routes/users"),
    indexRoutes=require("./routes/index");
    


mongoose.connect("mongodb://localhost/user",{useMongoClient:true});
mongoose.Promise = global.Promise;
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname +"/public"));
app.set("view engine","ejs");
app.use(flash());



//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret:"Project",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser=req.user;
    res.locals.error=req.flash("error");
     res.locals.success=req.flash("success");
    next();
});


app.use(indexRoutes);
app.use(userRoutes);


app.listen(process.env.PORT, process.env.IP, function (){
    console.log("The server has started");
});
