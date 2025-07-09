if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./Utility/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const {isLoggedIn} = require("./middleware.js");
const DBLINK = process.env.ATLAS_DB;

const Store = MongoStore.create({
    mongoUrl: DBLINK,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 2 * 24 * 3600,
});
Store.on("error", () => {
    console.log("error in MONGO SESSION STORE", err);
});

const sessionOptions = {
    Store,
    secret: process.env.SECRET,
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

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.warning = req.flash("warning");
    res.locals.currUser = req.user;
    next();
});


//For routers requirement
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("public", path.join(__dirname, "public"));
app.use(express.urlencoded({ extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));


async function main() {
    await mongoose.connect(DBLINK);
};
// mongodb://127.0.0.1:27017/wanderlust
main()
.then( () => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});

//For the Signup Router
app.use("/", userRouter);

// Root page
app.get("/", (req,res) => {
    res.render("listings/home.ejs");
});

//For listings Router Part
app.use("/listings", isLoggedIn , listingsRouter);

//For Reviews Router Part
app.use("/listings/:id/reviews",isLoggedIn ,reviewsRouter);

//Navigation Links
app.get("/terms",(req,res) => {
    res.render("Miscellaneous/terms.ejs");
});
app.get("/contact",(req,res) => {
    res.render("Miscellaneous/contact.ejs");
});
app.get("/about",(req,res) => {
    res.render("Miscellaneous/about.ejs");
});

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