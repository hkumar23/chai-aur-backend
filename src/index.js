// require('dotenv').config({path: './env'})
import dotenv from "dotenv"; //this is consistent
import connectDB from "./db/index.js";
import { app } from "./app.js";

//dotenv make all evironment var available
dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
