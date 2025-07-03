const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const Listing = require("../models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("../Utility/wrapAsync.js");
const ExpressError = require("../Utility/ExpressError.js");
const { listingSchema ,reviewSchema } = require("../schema.js");
const Review = require("../models/review.js"); 
const listings = require("../routes/listing.js");
const router = express.Router({ mergeParams: true });



//Validation Functions
const validateListing = (req,res,next) => {
    let {title,description,image,price,country,location} = req.body;
    let {error} = listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400, error.details[0].message);
    }else{
        next();
    }
};



//listings route
router.get("/", wrapAsync(async(req,res) => {
    const alllistings = await Listing.find({});
    // res.json(alllistings);
    res.render("listings/index.ejs", {alllistings});
}));

//new route
router.get("/new", (req,res) => {
    if(req.isAuthenticated()){
        res.render("listings/new.ejs");
    }else{
        req.flash("error" , "Need to Login For create Listing");
        res.redirect("/login");
    }

});

//show route
router.get("/:id", wrapAsync(async (req,res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    // res.json({ jsonrpc: "2.0", listing, id });
    if(!listing){
        req.flash("error", "Listing Not Found");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}));

//Create route
router.post("/",validateListing ,wrapAsync(async(req,res,next) => {
    let {title,description,image,price,country,location} = req.body;
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        req.flash("success","New Listing Created Successfully");
        res.redirect("/listings");
}));

//edit route
router.get("/:id/edit", wrapAsync(async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing})
}));

//Update route
router.put("/:id", validateListing ,wrapAsync(async(req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success","Listing Updated Successfully");
    res.redirect(`/listings/${id}`);
}));

//Delete route
router.delete("/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("del","Listing Deleted Successfully");
    res.redirect("/listings");
}));

module.exports = router; 