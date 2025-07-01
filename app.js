const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./Utility/wrapAsync.js");
const ExpressError = require("./Utility/ExpressError.js");
const { listingSchema ,reviewSchema } = require("./schema.js");
const Review = require("./models/review.js"); 


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
};
main()
.then( () => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});

//Validation Functions
const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400, error.details[0].message);
    }else{
        next();
    }
};
const validateReview = (req,res,next) => {
    let{error} = reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400, error.details[0].message);
    }else{
        next();
    }
};





// Root page
app.get("/", (req,res) => {
    res.send("home");
});

//listings route
app.get("/listings", wrapAsync(async(req,res) => {
    const alllistings = await Listing.find({});
    // res.json(alllistings);
    res.render("listings/index.ejs", {alllistings});
}));

//new route
app.get("/listings/new", (req,res) => {
    res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id", wrapAsync(async (req,res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    // res.json({ jsonrpc: "2.0", listing, id });
    res.render("listings/show.ejs",{listing});
}));

//Create route
app.post("/listings",validateListing ,wrapAsync(async(req,res,next) => {
    let {title,description,image,price,country,location} = req.body;
    validateListing(req,res,next);
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
}));

//edit route
app.get("/listings/:id/edit", wrapAsync(async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing})
}));

//Update route
app.put("/listings/:id", validateListing ,wrapAsync(async(req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//reviews route
app.post("/listings/:id/reviews", validateReview ,wrapAsync(async(req,res) => {
    let {id} = req.params;  
    let {review} = req.body;
    let listing = await Listing.findById(id);   
    let newReview = new Review(review);
    
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));
//Delete Review route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req,res) => {
    let {id, reviewId} = req.params;

    Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));



//Delete route
app.delete("/listings/:id", wrapAsync(async (req,res) => {
    if(!req.body.listing){
        throw new ExpressError(400,"Bad Request - Listing data is required");
    }
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

//For the error
app.all("*",(req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    // res.status(statusCode).send(message);
    res.render("error.ejs", {err});
});

app.listen(port , () => {
    console.log(`server is listening at http://localhost:${port}`);
});