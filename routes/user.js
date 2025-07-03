const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../Utility/wrapAsync.js");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");

router.get("/signup",(req,res) => {
    res.render("users/signup.ejs");
});

router.post("/signup",
    savedRedirectUrl,
    async(req,res) => {
    let {username , email , password} = req.body;
    try{
        const newUser = new User({username , email});
        const registeredUser = await User.register(newUser , password);
        req.login(registeredUser, (err) => {
            if(err){
                return next(err);
            }else{
                req.flash("success" , "Welcome to wanderlust");
                let redirect = res.locals.redirectUrl || "/";
                res.redirect(redirect);
            }
        }) 
    }catch (err){
        req.flash("error", err.message);
        res.redirect("/signup");
    }
});

router.get("/login", (req,res) => {
    res.render("users/login.ejs");
});

router.post("/login",
    savedRedirectUrl,
    passport.authenticate("local" , { 
    failureRedirect: '/login',
    failureFlash: true}),
    wrapAsync((req,res) => {
        req.flash("success" , "Welcome back to wanderlust");
        let redirect = res.locals.redirectUrl || "/";
        res.redirect(redirect);
    }
));

router.get("/logout" , (req,res) => {
    req.logout((err) => {
        if(err) {
          return  next();
        }
        req.flash("warning" , "You are logged out");
        res.redirect("/login");
    });
});

module.exports = router;