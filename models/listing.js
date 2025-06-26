const express = require("express");
const mongoose = require("mongoose");
let link = "https://www.google.com/url?sa=i&url=https%3A%2F%2Figropar.com%2Fen%2F16-depilacion&psig=AOvVaw2RVHT5sB2vNHVHrxLO88-L&ust=1750572262300000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCKCU3pyNgo4DFQAAAAAdAAAAABAE";

const listingSchema = new mongoose.Schema(
    {
       title: {
        type : String,
        required : true
       },
       description : String,
       image: {
        filename: String,
        url: {
            type: String,
            default: link,
            set: (v) => v === "" ? `${link}` : v,
        }
       },
       price: Number,
       location : String,
       country : String 
    }
);

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;