// require('dotenv').config({path: './env'})
import dotenv from "dotenv"; //this is consistent
import connectDB from "./db/index.js";
//dotenv make all evironment var available
dotenv.config({
    path:'./env'
})

connectDB();