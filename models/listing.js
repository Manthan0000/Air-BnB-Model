 const express = require("express");
const mongoose = require("mongoose");
let link = "https://images.unsplash.com/photo-1657983794129-95527a7b7738?q=80&w=726&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

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
            set: (v) => (!v ? link : v),
        }
       },
       price: Number,
       location : String,
       country : String 
    }
);

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;