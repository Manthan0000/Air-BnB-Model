const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./Utility/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");


const sessionOptions = {
    secret: "1234",
    resave: false,
    saveUninitialized: true,    
    cokkie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.del = req.flash("del");
    next();
});



//For routers requirement
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");


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



// Root page
app.get("/", (req,res) => {
    res.send("home");
});

//For listings Router Part
app.use("/listings", listings);

//For Reviews Router Part
app.use("/listings/:id/reviews", reviews);



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