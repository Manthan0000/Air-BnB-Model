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
const { isLoggedIn, isOwner ,validateListing } = require("../middleware.js");
const {storage} = require("../cloudConfig.js");
const multer = require('multer');
const { url } = require("inspector");
const upload = multer({storage});




//listings route
router.get("/", wrapAsync(async(req,res) => {
    const alllistings = await Listing.find({});
    // res.json(alllistings);
    res.render("listings/index.ejs", {alllistings});
}));

//new route
router.get("/new", isLoggedIn ,(req,res) => {
    if(req.isAuthenticated()){
        res.render("listings/new.ejs");
    }else{
        req.flash("error" , "Need to Login For create Listing");
        res.redirect("/login");
    }

});

//show route
router.get("/:id", isLoggedIn ,wrapAsync(async (req,res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path :"reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    // res.json({ jsonrpc: "2.0", listing, id });
    if(!listing){
        req.flash("error", "Listing Not Found");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}));

//Create route
// router.post("/",
//     isLoggedIn,
//     upload.single("listing[image]"),
//     validateListing,
//     wrapAsync(async(req,res,next) => {
//     let {title,description,image,price,country,location} = req.body;
//         let url = req.file.path;
//         let filename = req.file.filename;
//         const newListing = new Listing(req.body.listing);
//         newListing.owner = req.user._id;
//         newListing.image = {url,filename};
//         await newListing.save();
//         req.flash("success","New Listing Created Successfully");
//         res.redirect("/listings");
// }));
router.post("/",
    isLoggedIn,
    upload.single("image"), // must match the input name!
    (req, res, next) => {
        if (!req.body.listing) req.body.listing = {};
        if (req.file) {
            req.body.listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }
        next();
    },
    validateListing,
    wrapAsync(async(req,res,next) => {
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success","New Listing Created Successfully");
        res.redirect("/listings");
    })
);

//edit route
router.get("/:id/edit", isLoggedIn, isOwner ,wrapAsync(async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing})
}));

//Update route
router.put("/:id",
    upload.single("listing[image]"),
    isLoggedIn,
    isOwner,
    validateListing ,
    wrapAsync(async(req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }  
    req.flash("success","Listing Updated Successfully");
    res.redirect(`/listings/${id}`);
}));

//Delete route
router.delete("/:id", isLoggedIn, isOwner ,wrapAsync(async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("warning","Listing Deleted Successfully");
    res.redirect("/listings");
}));

module.exports = router; 