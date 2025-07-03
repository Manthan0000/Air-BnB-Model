module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        req.flash("error", "You need to register or login");
        return res.status(401).render("error.ejs", { err: { statusCode: 401, message: "You need to register or login" } });
    }
    next();
};