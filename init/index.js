const express = require("express");
const app = express();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const path = require("path");
app.use(express.urlencoded({ extended: true}));

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
main()
.then(() => {
    console.log("DB connected");
})
.catch((err) => {
    console.log(err);
});

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "686644e8932c2a3b81914f14"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();