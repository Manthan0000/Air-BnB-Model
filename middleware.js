const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./Utility/ExpressError.js");
const { listingSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("warning", "You need to register or login");
        return res.redirect("/login");
    }
    next();
};

module.exports.savedRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async(req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You don't have permission to edit");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

//Validation Functions
module.exports.validateListing = (req,res,next) => {
    let {title,description,image,price,country,location} = req.body;
    let {error} = listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400, error.details[0].message);
    }else{
        next();
    }
};

module.exports.isAuthor = async(req,res,next) => {
    let {id ,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error", "You don't have permission to delete");
        return res.redirect(`/listings/${id}`);
    }
    next();
};