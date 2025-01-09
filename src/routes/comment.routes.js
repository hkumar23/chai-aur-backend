import { Router } from "express";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/get/:videoId").get(getVideoComments);
router.route("/add").post(verifyJWT, addComment);
router.route("/update").post(verifyJWT, updateComment);
router.route("/delete").post(verifyJWT, deleteComment);
export default router;
