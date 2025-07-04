const express = require("express");
const router = express.Router({ mergeParams: true });
const methodOverride = require("method-override");
const wrapAsync = require("../Utility/wrapAsync.js");
const ExpressError = require("../Utility/ExpressError.js");
const { listingSchema ,reviewSchema } = require("../schema.js");
const Review = require("../models/review.js"); 
const Listing = require("../models/listing.js");
const {isLoggedIn , isAuthor} = require("../middleware.js");



const validateReview = (req,res,next) => {
    let{error} = reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400, error.details[0].message);
    }else{
        next();
    }
};

//reviews route
router.post("/", isLoggedIn ,validateReview, wrapAsync(async(req,res) => {
    let {id} = req.params;  
    let {review} = req.body;
    let listing = await Listing.findById(id);   
    let newReview = new Review(review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success","Review Added Successfully");
    res.redirect(`/listings/${listing._id}`);
}));
//Delete Review route
router.delete("/:reviewId", 
    isLoggedIn,
    isAuthor,
    wrapAsync(async (req,res) => {
    let {id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("warning","Review Deleted successfully");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;