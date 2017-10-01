var express=require("express");
var router=express.Router({mergeParams:true});
var User=require("../models/user");
var geocoder = require("geocoder");

//HOME PAGE
router.get("/home",function(req,res){
    res.render("home",{currentUser:req.user});
});

//DASHBOARD
router.get("/dashboard", isLoggedIn, function(req,res){
    var currentUser=req.user;
    var name=  currentUser.name ;
    var username= currentUser.username;
    var usertype= currentUser.usertype;
    var image= currentUser.image;
    var pincode= currentUser.pincode;
    
    
    geocoder.geocode(currentUser.location, function (err, data) {
        
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;
            
            var location = data.results[0].formatted_address;
            var newData={name: name, username: username, usertype: usertype, location: location, lat: lat, lng: lng, image: image, pincode:pincode};
            res.render("dashboard" ,{currentUserLoc:newData});
            }
    
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