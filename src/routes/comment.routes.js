import { Router } from "express";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/get/:videoId").get(getVideoComments);
router.route("/add").post(addComment);
router.route("/update").post(updateComment);
router.route("/delete").post(deleteComment);
export default router;
