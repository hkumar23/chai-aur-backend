import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post( 
    upload.fields([ // this is the middleware executed before registerUser
        {
            name:"avatar",
            maxCount:1
        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]), 
    registerUser, //If someone sends a request on register route this method is called
);

export default router;