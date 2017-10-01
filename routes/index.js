var express=require("express");
var router=express.Router({mergeParams:true});
var User= require("../models/user");
var passport=require("passport");
var bcrypt = require('bcrypt-nodejs'),
    async = require('async'),
    crypto = require('crypto'),
    nodemailer=require("nodemailer");

//ROOt ROUTE
router.get("/", function(req,res){
    res.render("landing");
});

//REGISTER
router.get("/register",function(req,res){
    res.render("register");
});

//HANDLE SIGN UP LOGIC
router.post("/register",function(req,res){
    User.register(new User({name:req.body.name, username:req.body.username, usertype:req.body.usertype, location:req.body.location, image:req.body.image, pincode:req.body.pincode}),req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error",err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req,res, function(){
            req.flash("success","Welcome " + user.name);
            res.redirect("/dashboard");
        });
    });
        
});

//LOGIN
router.get("/login",function(req,res){
    res.render("login");
});

//LOGIN LOGIC
router.post("/login", passport.authenticate("local",
{
    successRedirect:"/dashboard",
    failureRedirect:"/login"
}));

//LOGOUT
router.get("/logout", function(req,res){
    req.logout();
    req.flash("success","You have successfully logged out!");
    res.redirect("/home");
});

// FORGOT PASSWORD
router.get('/forgot', function(req, res) {
  res.render('forgot');
  });

router.post('/forgot', isLoggedIn ,function(req, res, next) {
    var currentUser=req.user;
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
        var email=currentUser.email
        
        
      User.findOne({ email: currentUser.email }, function(err, user) {
          console.log(email);
              if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        }); 
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'learntocodeinfo@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'learntocodeinfo@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'learntocodeinfo@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'learntocodeinfo@mail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/dashboard');
  });
});
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to login first!");
    res.redirect("/login");
}
module.exports=router;